import fs from 'fs';
import z, { ZodError } from 'zod';
import csvParser from 'csv-parser';
import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { processAgentsBatch } from '../utils/process-batch-agents';
import { AgentStatus, AuthPayload } from '@lotaria-nacional/lotto';
import uploadCsvToImageKit from '../../../utils/upload-csv-to-image-kit';

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

  const stream = fs
    .createReadStream(file)
    .pipe(csvParser({ mapHeaders: ({ header }) => header.replace(/^\uFEFF/, '').trim() }));
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

  const url = await uploadCsvToImageKit(file);

  if (imported > 0) {
    await prisma.$transaction(async tx => {
      await audit(tx, 'IMPORT', {
        user,
        before: null,
        after: null,
        entity: 'AGENT',
        description: `Importou ${imported} agentes`,
        metadata: {
          file: url,
        },
      });
    });
  }

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
  training_date: z
    .string()
    .optional()
    .transform(val => {
      if (!val || val.trim() === '') {
        // Gera uma data aleatória caso não exista
        const year = new Date().getFullYear();
        const month = Math.floor(Math.random() * 12);
        const day = Math.floor(Math.random() * 28) + 1;
        return new Date(year, month, day);
      }

      let day: number, month: number, year: number;

      if (/^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(val)) {
        // YYYY-MM-DD ou YYYY/MM/DD
        [year, month, day] = val.split(/[-/]/).map(Number);
      } else if (/^\d{1,2}[\/-]\d{1,2}[\/-]\d{4}$/.test(val)) {
        // D/M/YYYY ou DD/MM/YYYY ou D/MM/YYYY etc
        [day, month, year] = val.split(/[-/]/).map(Number);
      } else {
        // formato inválido: gera data aleatória
        const currentYear = new Date().getFullYear();
        const randomMonth = Math.floor(Math.random() * 12);
        const randomDay = Math.floor(Math.random() * 28) + 1;
        return new Date(currentYear, randomMonth, randomDay);
      }

      return new Date(year, month - 1, day);
    }),
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
