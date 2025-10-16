import fs from 'fs';
import z from 'zod';
import csvParser from 'csv-parser';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { processBatchPos } from '../../../utils/process-batch';

interface ImportPosResponse {
  imported: number;
  errors: { row: any; error: any }[];
}

export async function importPosFromCsvService(filePath: string, user: AuthPayload): Promise<ImportPosResponse> {
  const errors: any[] = [];
  let imported = 0;
  const BATCH_SIZE = 500;

  const stream = fs.createReadStream(filePath).pipe(csvParser());
  const posBatch: ImportPosDTO[] = [];

  for await (const row of stream) {
    try {
      const input: ImportPosDTO = {
        agent_id_reference: row['ID REVENDEDOR'],
        province: row['PROVINCIA'],
        admin_name: row['ADMINISTRACAO'],
        city: row['CIDADE'],
        area: row['AREA'],
        zone: row['ZONA'],
        status: row['ESTADO'],
        type_name: row['TIPOLOGIA'],
        licence: row['LICENCA'],
        coordinates: row['COORDENADAS'],
      };

      const parsed = importPosSchema.parse(input);

      posBatch.push(parsed);

      if (posBatch.length >= BATCH_SIZE) {
        imported += await processBatchPos(posBatch);
      }
    } catch (err: any) {
      errors.push({ row, error: err.errors || err.message });
    }
  }

  if (posBatch.length > 0) {
    imported += await processBatchPos(posBatch);
  }

  return { errors, imported };
}

const importPosSchema = z.object({
  agent_id_reference: z.coerce.number().int().optional(),
  province: z
    .string()
    .transform((val) => val?.trim().normalize('NFC'))
    .optional(),
  admin_name: z
    .string()
    .optional()
    .transform((val) => val?.trim()),
  city: z.string().transform((val) => val?.trim().normalize('NFC')),

  area: z.string().transform((val) => {
    return val.replace(/^á?rea\s*/i, '').trim();
  }),

  zone: z.string().transform((val) => {
    const zone = Number(val.replace(/^zona\s*/i, '').trim());
    return isNaN(zone) ? null : zone;
  }),

  status: z.string().optional(),
  type_name: z.string().min(1, 'Tipologia obrigatória'),
  licence: z.string().optional(),
  coordinates: z.string().optional(),
});

export type ImportPosDTO = z.infer<typeof importPosSchema>;
