import z from 'zod';
import fs from 'fs';
import csvParser from 'csv-parser';
import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { parseDate } from '../../../utils/date';
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
  activationDate: z.string().optional().transform(parseDate),
});

export type ImportTerminalsDTO = z.infer<typeof importTerminalsSchema>;

export async function importTerminalsFromCsvService(file: string, user: AuthPayload): Promise<ImportTerminalsResponse> {
  const errors: { row: any; error: any }[] = [];
  const stream = fs
    .createReadStream(file)
    .pipe(csvParser({ mapHeaders: ({ header }) => header.replace(/^\uFEFF/, '').trim() }));

  let totalImported = 0;

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
        errors.push({ row, error: result.error.format });
        continue;
      }

      const parsed = result.data;

      let status: TerminalStatus = 'ready';
      let agentIdRef: number | null = null;

      if (parsed.idReference) {
        const agent = await prisma.agent.findUnique({
          where: { id_reference: parsed.idReference },
          include: {
            terminal: { select: { id: true } },
            pos: { select: { id: true } },
          },
        });

        if (agent) {
          agentIdRef = agent.id_reference;
          if (agent.pos?.id) {
            status = 'on_field';
          }
        }
      }

      await prisma.terminal.upsert({
        where: { serial: parsed.serialNumber }, // base para update/create
        create: {
          serial: parsed.serialNumber,
          device_id: parsed.deviceId,
          agent_id_reference: agentIdRef,
          activated_at: parsed.activationDate ?? undefined,
          status: parsed.simCardNumber ? status : 'stock',
          sim_card: parsed.simCardNumber
            ? {
                connectOrCreate: {
                  where: { number: parsed.simCardNumber },
                  create: {
                    number: parsed.simCardNumber,
                    pin: parsed.pin,
                    puk: parsed.puk,
                    chip_serial_number: parsed.chipSerialNumber,
                    status: 'active',
                  },
                },
              }
            : undefined,
        },
        update: {
          device_id: parsed.deviceId,
          agent_id_reference: agentIdRef,
          activated_at: parsed.activationDate,
          status: parsed.simCardNumber ? status : 'stock',
          sim_card: parsed.simCardNumber
            ? {
                connectOrCreate: {
                  where: { number: parsed.simCardNumber },
                  create: {
                    number: parsed.simCardNumber,
                    pin: parsed.pin,
                    puk: parsed.puk,
                    chip_serial_number: parsed.chipSerialNumber,
                    status: 'active',
                  },
                },
              }
            : undefined,
        },
      });

      totalImported++;
    } catch (err: any) {
      errors.push({ row, error: err.message || err });
    }
  }

  const url = await uploadCsvToImageKit(file);

  if (totalImported > 0) {
    await prisma.$transaction(async tx => {
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
