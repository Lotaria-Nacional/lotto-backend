import fs from 'fs';
import z from 'zod';
import csvParser from 'csv-parser';
import prisma from '../../../lib/prisma';
import { CreateTerminalDTO, createTerminalSchema, TerminalStatus, terminalStatusSchema } from '@lotaria-nacional/lotto';

interface ImportTerminalsResponse {
  imported: number;
  errors: { row: any; error: any }[];
}

export async function importTerminalsFromCsvService(filePath: string): Promise<ImportTerminalsResponse> {
  const terminalsBatch: any[] = [];
  const errors: any[] = [];
  const BATCH_SIZE = 500;

  const stream = fs.createReadStream(filePath).pipe(csvParser());
  for await (const row of stream) {
    let status: TerminalStatus = 'ready';

    try {
      if (row.agent_id_reference) {
        const agent = await prisma.agent.findUnique({
          where: { id_reference: Number(row.agent_id_reference) },
          include: { pos: { select: { id: true } } },
        });

        if (agent?.pos?.id) {
          status = 'on_field';
        }
      }

      const input: CreateTerminalDTO & { agent_id_reference?: number; status: TerminalStatus } = {
        serial: row.serial,
        arrived_at: new Date(row.arrived_at),
        device_id: row.device_id || undefined,
        agent_id_reference: Number(row.agent_id_reference) || undefined,
        status,
      };

      const parsed = createTerminalSchema
        .extend({ status: terminalStatusSchema, agent_id_reference: z.number().optional() })
        .parse(input);

      terminalsBatch.push(parsed);
      console.log('ROW: ', row.agent_id_reference);
      console.log('PARSED: ', parsed.agent_id_reference);

      if (terminalsBatch.length >= BATCH_SIZE) {
        await prisma.terminal.createMany({
          data: terminalsBatch,
          skipDuplicates: true,
        });

        terminalsBatch.length = 0;
      }
    } catch (err: any) {
      errors.push({ row, error: err.erros || err.message });
      console.log(err);
    }
  }

  if (terminalsBatch.length > 0) {
    await prisma.terminal.createMany({
      data: terminalsBatch,
      skipDuplicates: true,
    });
  }

  return { errors, imported: terminalsBatch.length + errors.length };
}
