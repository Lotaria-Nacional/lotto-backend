import z from 'zod';
import fs from 'fs';
import csvParser from 'csv-parser';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { handleImportError, parseImportedDate } from '../../../utils/import-utils';
import { processBatchLicences } from '../../../utils/process-batch';

export async function importLicencesFromCsvService(filePath: string, user: AuthPayload) {
  const errors: any[] = [];
  let imported = 0;
  const BATCH_SIZE = 500;

  const stream = fs.createReadStream(filePath).pipe(csvParser());
  const licencesBatch: ImportLicenceDTO[] = [];

  for await (const row of stream) {
    try {
      const input: ImportLicenceDTO = {
        reference: row['REFERENCIA'],
        coordinates: row['COORDENADAS'],
        description: row['DESCRICAO'],
        emitted_at: row['DATA DE EMISSAO'],
        district: row['DISTRITO'],
        expires_at: row['DATA DE EXPIRACAO'],
        number: row['Nº DOCUMENTO'],
        limit: row['LIMITE'],
        admin_name: row['ADMINISTRACAO'],
      };

      const parsed = importLicenceSchema.parse(input);

      licencesBatch.push(parsed);

      if (licencesBatch.length >= BATCH_SIZE) {
        imported += await processBatchLicences(licencesBatch);
      }
    } catch (err: any) {
      handleImportError({ err, errors, row });
    }
  }

  if (licencesBatch.length > 0) {
    imported += await processBatchLicences(licencesBatch);
  }

  console.log({ imported, errors: errors.length });

  return { imported, errors };
}

const importLicenceSchema = z.object({
  reference: z.string(),
  admin_name: z.string().transform((val) => val.toLowerCase().trim()),
  coordinates: z.string().optional(),
  district: z.string().optional(),
  emitted_at: z.transform(parseImportedDate).optional(),
  expires_at: z.transform(parseImportedDate).optional(),
  number: z.string(),
  description: z.string(),
  limit: z.coerce.number().default(50),
});

export type ImportLicenceDTO = z.infer<typeof importLicenceSchema>;
