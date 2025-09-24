import fs from 'fs';
import z from 'zod';
import csvParser from 'csv-parser';
import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { processPosBatch } from '../utils/process-pos-batch';

interface ImportPosResponse {
  imported: number;
  errors: { row: any; error: any }[];
}

export async function importPosFromCsvService(filePath: string, user: AuthPayload): Promise<ImportPosResponse> {
  const posBatch: ImportPosDTO[] = [];
  const errors: any[] = [];
  const BATCH_SIZE = 500;
  let imported = 0;

  const stream = fs.createReadStream(filePath).pipe(csvParser());

  for await (const row of stream) {
    try {
      const input: ImportPosDTO = {
        idRevendedor: row['ID REVENDEDOR'],
        provincia: row['PROVINCIA'],
        administracao: row['ADMINISTRACAO'],
        cidade: row['CIDADE'],
        area: row['AREA'],
        zona: row['ZONA'],
        estado: row['ESTADO'],
        tipologia: row['TIPOLOGIA'],
        licenca: row['LICENCA'],
        coordenadas: row['COORDENADAS'],
      };

      const parsed = importPosSchema.parse(input);

      posBatch.push(parsed);

      if (posBatch.length >= BATCH_SIZE) {
        await processPosBatch({ posList: posBatch, user, errors });
        imported += posBatch.length;
        posBatch.length = 0;
      }
    } catch (err: any) {
      errors.push({ row, error: err.errors || err.message });
    }
  }

  if (posBatch.length > 0) {
    await processPosBatch({ posList: posBatch, user, errors });
    imported += posBatch.length;
  }

  await prisma.$transaction(async (tx) => {
    await audit(tx, 'IMPORT', {
      user,
      entity: 'POS',
      before: null,
      after: null,
      description: `Importou ${imported} pontos de venda`,
    });
  });

  return { errors, imported };
}
// ID REVENDEDOR | PROVINCIA | ADMINISTRACAO | CIDADE | AREA | ZONA | ESTADO | TIPOLOGIA | LICENCA | COORDENADAS

const importPosSchema = z.object({
  idRevendedor: z.coerce.number().int().optional(),
  provincia: z
    .string()
    .transform((val) => val?.trim().normalize('NFC'))
    .optional(),
  administracao: z
    .string()
    .optional()
    .transform((val) => val?.trim()),
  cidade: z
    .string()
    .optional()
    .transform((val) => val?.trim().normalize('NFC')),
  area: z
    .string()
    .optional()
    .transform((val) => val?.toUpperCase()),
  zona: z.coerce.number().int().optional(),
  estado: z.string().optional(),
  tipologia: z.string().min(1, 'Tipologia obrigatória'),
  licenca: z.string().optional(),
  coordenadas: z.string().optional(),
});

export type ImportPosDTO = z.infer<typeof importPosSchema>;
