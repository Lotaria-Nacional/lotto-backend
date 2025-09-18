import fs from 'fs';
import csvParser from 'csv-parser';
import prisma from '../../../lib/prisma';
import { AuthPayload, CreateAgentDTO, createAgentSchema } from '@lotaria-nacional/lotto';

interface ImportAgentsFromCsvServiceResponse {
  imported: number;
  errors: { row: any; error: any }[];
}

export async function importAgentsFromCsvService(
  filePath: string,
  user: AuthPayload,
  onProgress?: (progress: number) => void
): Promise<ImportAgentsFromCsvServiceResponse> {
  const agentsBatch: any[] = [];
  const errors: any[] = [];
  const BATCH_SIZE = 500;

  const stream = fs.createReadStream(filePath).pipe(csvParser());

  for await (const row of stream) {
    try {
      const input: CreateAgentDTO = {
        id_reference: Number(row.id_reference),
        first_name: row.first_name,
        last_name: row.last_name,
        genre: row.genre,
        bi_number: row.bi_number || undefined,
        phone_number: row.phone_number || undefined,
        agent_type: row.agent_type,
        training_date: new Date(row.training_date),
      };

      const parsed = createAgentSchema.parse(input);
      agentsBatch.push(parsed);

      if (agentsBatch.length >= BATCH_SIZE) {
        await prisma.agent.createMany({
          data: agentsBatch,
          skipDuplicates: true,
        });

        agentsBatch.length = 0;
      }
    } catch (err: any) {
      errors.push({ row, error: err.errors || err.message });
      console.error(err);
    }
  }

  if (agentsBatch.length > 0) {
    await prisma.agent.createMany({
      data: agentsBatch,
      skipDuplicates: true,
    });
  }

  return { errors, imported: agentsBatch.length + errors.length };
}
