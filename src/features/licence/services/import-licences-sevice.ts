import fs from 'fs';
import csvParser from 'csv-parser';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { auditImport } from '../../../utils/import-utils';
import { ImportLicenceDTO } from '../validation/import-licence-schema';
import { createTransformLicenceStream } from '../stream/transform-licences';
import { processBatchLicences } from '../utils/process-batch-licences';
import { licenceEmitDone, licenceEmitError, licenceEmitProgress } from '../sse/licence-emitter';

export async function importLicencesService(file: string, user: AuthPayload) {
  const errors: any[] = [];
  const batch: ImportLicenceDTO[] = [];
  let imported = 0;
  let total = 0;
  let totalLines = 0;

  totalLines = await new Promise<number>((resolve, reject) => {
    let count = 0;
    fs.createReadStream(file)
      .pipe(csvParser())
      .on('data', () => count++)
      .on('end', () => resolve(count))
      .on('error', reject);
  });

  console.log(`======== TOTAL LINES: ${totalLines} =========`);

  const stream = fs
    .createReadStream(file)
    .pipe(csvParser({ mapHeaders: ({ header }) => header.trim() }))
    .pipe(
      createTransformLicenceStream(batch, errors, async () => {
        const count = await processBatchLicences(batch);
        imported += count;
        total += count;
        batch.length = 0;
        const percent = Math.min(Math.round((imported / totalLines) * 100), 100);
        licenceEmitProgress({ percent });
        console.log(`COUNT: ${count}, IMPORTED: ${imported}, TOTAL: ${total}, PERCENT: ${percent}`);
      })
    );

  stream.on('data', (data) => console.log(`STREAMING: ${JSON.stringify(data)}`));

  stream.on('end', async () => {
    try {
      if (batch.length > 0) {
        const count = await processBatchLicences(batch);
        imported += count;
        const percent = Math.min(Math.round((imported / totalLines) * 100), 100);
        licenceEmitProgress({ percent });

        console.log(`========= STREAM END ========= `);
        console.log(`========= TOTAL IMPORTED: ${imported} =========`);
      }

      await auditImport({
        file,
        user,
        imported,
        entity: 'LICENCE',
        desc: 'licenças',
      });

      licenceEmitDone({ imported, total, errors });
    } catch (err) {
      licenceEmitError(err);
    }
  });

  stream.on('error', (err) => {
    licenceEmitError(err);
    console.log(`========= STREAM ERROR: ${err} =========`);
  });

  return { imported, errors };
}
