import z from 'zod';
import fs from 'fs';
import csvParser from 'csv-parser';
import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { AuthPayload, TerminalStatus } from '@lotaria-nacional/lotto';
import uploadCsvToImageKit from '../../../utils/upload-csv-to-image-kit';

interface ImportTerminalsResponse {
  imported: number;
  errors: { row: any; error: any }[];
}

const importTerminalsSchema = z.object({
  idReference: z.coerce.number().int().nullable().optional(),
  serialNumber: z.string().min(1, 'Número de série obrigatório'),
  deviceId: z.string().optional(),
  simCardNumber: z.string().optional(),
  pin: z.string().optional(),
  puk: z.string().optional(),
  status: z.string().optional(),
  chipSerialNumber: z.string().optional(),
  activationDate: z
    .string()
    .nullable()
    .transform((val) => {
      if (!val) return null;
      try {
        if (val.includes('/')) {
          const [day, month, year] = val.split('/');
          const date = new Date(`${year}-${month}-${day}`);
          return isNaN(date.getTime()) ? null : date;
        }
        const date = new Date(val);
        return isNaN(date.getTime()) ? null : date;
      } catch {
        return null;
      }
    })
    .optional(),
});

export type ImportTerminalsDTO = z.infer<typeof importTerminalsSchema>;

export async function importTerminalsFromCsvService(file: string, user: AuthPayload): Promise<ImportTerminalsResponse> {
  const errors: { row: any; error: any }[] = [];
  const BATCH_SIZE = 500;
  const stream = fs.createReadStream(file).pipe(csvParser());

  let totalImported = 0;
  const terminalsBatch: ImportTerminalsDTO[] = [];

  for await (const row of stream) {
    try {
      const result = importTerminalsSchema.safeParse({
        idReference: row['ID REVENDEDOR'],
        serialNumber: row['Nº DE SERIE DO TERMINAL'],
        deviceId: row['DEVICE ID'],
        simCardNumber: row['Nº DO CARTAO UNITEL'],
        status: row['ESTADO'],
        pin: row['PIN'],
        puk: row['PUK'],
        chipSerialNumber: row['Nº DE SERIE DO CHIP'],
        activationDate: row['DATA DA ACTIVACAO'],
      });

      if (!result.success) {
        errors.push({ row, error: result.error.format() });
        continue;
      }

      const parsed = result.data;

      // === validação do agente ===
      let status: TerminalStatus = 'ready';
      let agentIdRef: number | null = null;

      if (parsed.idReference) {
        const agent = await prisma.agent.findUnique({
          where: { id_reference: parsed.idReference },
          include: { terminal: { select: { id: true } } },
        });

        if (agent) {
          // se não tiver terminal, associa
          if (!agent.terminal) {
            agentIdRef = agent.id_reference;
            status = 'on_field';
          }
        }
      }

      // === inserção com simCard individual ===
      if (parsed.simCardNumber) {
        const existingSim = await prisma.simCard.findUnique({
          where: { number: parsed.simCardNumber },
        });

        if (existingSim) {
          await prisma.terminal.create({
            data: {
              serial: parsed.serialNumber,
              device_id: parsed.deviceId,
              agent_id_reference: agentIdRef,
              arrived_at: parsed.activationDate ?? undefined,
              status, // ready ou on_field
              sim_card: { connect: { id: existingSim.id } },
            },
          });
        } else {
          await prisma.terminal.create({
            data: {
              serial: parsed.serialNumber,
              device_id: parsed.deviceId,
              agent_id_reference: agentIdRef,
              arrived_at: parsed.activationDate ?? undefined,
              status,
              sim_card: {
                create: {
                  number: parsed.simCardNumber,
                  pin: parsed.pin,
                  puk: parsed.puk,
                  status: 'active',
                },
              },
            },
          });
        }

        totalImported++;
      } else {
        // === acumula no batch ===
        terminalsBatch.push({
          ...parsed,
          idReference: agentIdRef ?? undefined,
          // 👇 sem SIM card => estado = stock
          status: 'stock',
        });

        if (terminalsBatch.length >= BATCH_SIZE) {
          const result = await prisma.terminal.createMany({
            data: terminalsBatch.map((t) => ({
              serial: t.serialNumber,
              device_id: t.deviceId,
              status: (t.status as TerminalStatus) ?? 'stock',
              agent_id_reference: t?.idReference ?? null,
              arrived_at: t.activationDate ?? undefined,
            })),
            skipDuplicates: true,
          });
          totalImported += result.count;
          terminalsBatch.length = 0;
        }
      }
    } catch (err: any) {
      errors.push({ row, error: err.message || err });
    }
  }

  // === finalizar batch pendente ===
  if (terminalsBatch.length > 0) {
    const result = await prisma.terminal.createMany({
      data: terminalsBatch.map((t) => ({
        serial: t.serialNumber,
        device_id: t.deviceId,
        status: (t.status as TerminalStatus) ?? 'stock',
        agent_id_reference: t?.idReference ?? null,
        arrived_at: t.activationDate ?? undefined,
      })),
      skipDuplicates: true,
    });
    totalImported += result.count;
  }

  // === upload do ficheiro ===
  const url = await uploadCsvToImageKit(file);

  // === audit apenas se importou ===
  if (totalImported > 0) {
    await prisma.$transaction(async (tx) => {
      await audit(tx, 'IMPORT', {
        user,
        entity: 'TERMINAL',
        before: null,
        after: null,
        description: `Importou ${totalImported} terminais`,
        metadata: { file: url },
      });
    });
  }

  return { imported: totalImported, errors };
}
