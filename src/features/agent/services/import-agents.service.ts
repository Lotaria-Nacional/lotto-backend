import fs from 'fs';
import csvParser from 'csv-parser';
import { processAgentsBatch } from '../utils/process-batch-agents';
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
  const errors: any[] = [];
  let imported = 0;
  const BATCH_SIZE = 500;

  const stream = fs.createReadStream(filePath).pipe(csvParser());
  const agentsBatch: CreateAgentDTO[] = [];

  for await (const row of stream) {
    try {
      const input: CreateAgentDTO & { terminal_id?: number } = {
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
        await processAgentsBatch({ agents: agentsBatch, user, errors });
        imported += agentsBatch.length;
        agentsBatch.length = 0;
      }
    } catch (err: any) {
      errors.push({ row, error: err.errors || err.message });
    }
  }

  if (agentsBatch.length > 0) {
    await processAgentsBatch({ agents: agentsBatch, user, errors });
    imported += agentsBatch.length;
  }

  return { errors, imported };
}
