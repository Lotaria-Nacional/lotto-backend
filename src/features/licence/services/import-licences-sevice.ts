import fs from 'fs';
import csvParser from 'csv-parser';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { processBatchLicences } from '../utils/process-batch-licences';
import { auditImport, handleImportError } from '../../../utils/import-utils';
import { ImportLicenceDTO, importLicenceSchema } from '../validation/import-licence-schema';

export async function importLicencesFromCsvService(filePath: string, user: AuthPayload) {
  const errors: any[] = [];
  let imported = 0;
  const BATCH_SIZE = 500;
  const stream = fs
    .createReadStream(filePath)
    .pipe(csvParser({ mapHeaders: ({ header }) => header.replace(/^\uFEFF/, '').trim() }));

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

  await auditImport({ file: filePath, user, imported, entity: 'LICENCE', desc: 'licenças' });

  return { imported, errors };
}
