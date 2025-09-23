import z from 'zod';
import fs from 'fs';
import csvParser from 'csv-parser';
import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { NotFoundError } from '../../../errors';
import { AuthPayload, TerminalStatus, terminalStatusSchema } from '@lotaria-nacional/lotto';

interface ImportTerminalsResponse {
  imported: number;
  errors: { row: any; error: any }[];
}

export async function importTerminalsFromCsvService(file: string, user: AuthPayload): Promise<ImportTerminalsResponse> {
  const terminalsBatch: ImportTerminalsDTO[] = [];
  const errors: any[] = [];
  const BATCH_SIZE = 500;

  const stream = fs.createReadStream(file).pipe(csvParser());

  return await prisma.$transaction(async (tx) => {
    let status: TerminalStatus = 'ready';

    for await (const row of stream) {
      try {
        if (row['ID REVENDEDOR']) {
          const id_reference = Number(row['ID REVENDEDOR']);
          const agent = await tx.agent.findUnique({
            where: { id_reference },
            include: { pos: { select: { id: true } } },
          });

          if (!agent) {
            throw new NotFoundError('Agente não encontrado');
          }

          if (agent?.pos?.id) {
            status = 'on_field';
          }
        }

        const input: ImportTerminalsDTO = {
          idReference: row['ID REVENDEDOR'],
          serialNumber: row['Nº DE SERIE DO TERMINAL'],
          deviceId: row['DEVICE ID'],
          simCardNumber: row['Nº DO CARTAO UNITEL'],
          pin: row['PIN'],
          puk: row['PUK'],
          chipSerialNumber: row['Nº DE SERIE DO CHIP'],
          activationDate: row['DATA DA ACTIVACAO'],
        };

        const parsed = importTerminalsSchema.parse(input);

        // Se tem sim_card_number, trata individualmente
        if (parsed.serialNumber) {
          const existingSim = await tx.simCard.findUnique({
            where: { number: parsed.simCardNumber },
          });

          if (existingSim) {
            // SimCard já existe -> cria terminal ligado
            await tx.terminal.create({
              data: {
                serial: parsed.serialNumber,
                device_id: parsed.deviceId,
                agent_id_reference: parsed.idReference,
                arrived_at: parsed.activationDate,
                status,
                sim_card: {
                  connect: { id: existingSim.id },
                },
              },
            });
          } else {
            // Criar terminal + novo SimCard
            await tx.terminal.create({
              data: {
                serial: parsed.serialNumber,
                arrived_at: parsed.activationDate,
                device_id: parsed.deviceId,
                agent_id_reference: parsed.idReference,
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
        } else {
          // Caso não tenha sim_card -> batch
          terminalsBatch.push(parsed);

          if (terminalsBatch.length >= BATCH_SIZE) {
            await tx.terminal.createMany({
              data: terminalsBatch.map((t) => ({
                serial: t.serialNumber,
                device_id: t.deviceId,
                status,
                agent_id_reference: t.idReference,
                arrived_at: t.activationDate,
              })),
              skipDuplicates: true,
            });
            terminalsBatch.length = 0;
          }
        }
      } catch (err: any) {
        errors.push({ row, error: err.errors || err.message });
        console.log(err);
      }
    }

    if (terminalsBatch.length > 0) {
      await tx.terminal.createMany({
        data: terminalsBatch.map((t) => ({
          serial: t.serialNumber,
          device_id: t.deviceId,
          status,
          agent_id_reference: t.idReference,
          arrived_at: t.activationDate,
        })),
        skipDuplicates: true,
      });
    }

    await audit(tx, 'IMPORT', {
      user,
      entity: 'TERMINAL',
      before: null,
      after: null,
    });

    return { errors, imported: terminalsBatch.length + errors.length };
  });
}

const importTerminalsSchema = z.object({
  idReference: z.coerce.number().int(),
  serialNumber: z.string(),
  deviceId: z.string().optional(),
  simCardNumber: z.string(),
  pin: z.string(),
  puk: z.string(),
  chipSerialNumber: z.string().optional(),
  activationDate: z.coerce.date(),
});

export type ImportTerminalsDTO = z.infer<typeof importTerminalsSchema>;
