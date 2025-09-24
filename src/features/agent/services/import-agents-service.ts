import fs from 'fs';
import z, { ZodError } from 'zod';
import csvParser from 'csv-parser';
import { processAgentsBatch } from '../utils/process-batch-agents';
import { AgentStatus, AuthPayload } from '@lotaria-nacional/lotto';
import { audit } from '../../../utils/audit-log';
import prisma from '../../../lib/prisma';

interface ImportAgentsFromCsvServiceResponse {
  imported: number;
  errors: { row: any; error: any }[];
}

export async function importAgentsFromCsvService(
  file: string,
  user: AuthPayload
): Promise<ImportAgentsFromCsvServiceResponse> {
  const errors: any[] = [];
  let imported = 0;
  const BATCH_SIZE = 500;

  const stream = fs.createReadStream(file).pipe(csvParser());
  const agentsBatch: ImportAgentDTO[] = [];

  for await (const row of stream) {
    try {
      const input: ImportAgentDTO = {
        id_reference: row['ID'],
        name: row['NOME'],
        last_name: row['SOBRENOME'],
        gender: row['GENERO'],
        training_date: row['DATA  DE FORMACAO'],
        status: row['ESTADO'],
        phone_number: row['Nº TELEFONE'],
        bi_number: row['Nº DO BI'],
      };

      const parsed = importAgentsSchema.parse(input);

      agentsBatch.push(parsed);

      if (agentsBatch.length >= BATCH_SIZE) {
        await processAgentsBatch({ agents: agentsBatch, user, errors });
        imported += agentsBatch.length;
        agentsBatch.length = 0;
      }
    } catch (err) {
      if (err instanceof ZodError) {
        errors.push({
          row,
          error: err.issues.map(issue => ({
            campo: issue.path.join('.'),
            mensagem: issue.message,
          })),
        });
      } else {
        errors.push({ row, error: (err as any).message || err });
      }
    }
  }

  if (agentsBatch.length > 0) {
    await processAgentsBatch({ agents: agentsBatch, user, errors });
    imported += agentsBatch.length;
  }

  await prisma.$transaction(async tx => {
    await audit(tx, 'IMPORT', {
      user,
      before: null,
      after: null,
      entity: 'AGENT',
      description: `Importou ${imported} agentes`,
    });
  });

  return { errors, imported };
}

const importAgentsSchema = z.object({
  id_reference: z.coerce.number().int(),
  name: z.string().trim(),
  last_name: z.string().trim(),
  gender: z.string().transform(val => {
    const v = val.toLowerCase();
    if (v === 'm' || v === 'masculino') return 'male';
    if (v === 'f' || v === 'feminino') return 'female';
    return 'male';
  }),
  training_date: z.coerce.date(),
  status: z
    .string()
    .transform((val): AgentStatus | undefined => {
      const v = val.toLowerCase();
      if (v === 'activo') return 'active';
      if (v === 'negado') return 'discontinued';
      if (v === 'apto') return 'approved';
      if (v === 'agendado') return 'scheduled';
      return undefined;
    })
    .optional(),
  phone_number: z.string().trim(),
  bi_number: z.string().trim(),
});

export type ImportAgentDTO = z.infer<typeof importAgentsSchema>;
