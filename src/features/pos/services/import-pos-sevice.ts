import fs from 'fs';
import csvParser from 'csv-parser';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { ImportPosDTO } from '../validation/import-pos-schema';
import { auditImport } from '../../../utils/import-utils';
import { processBatchPos } from '../utils/process-batch-pos';
import { createTransformPosStream } from '../stream/transform-pos';
import { posEmitDone, posEmitError, posEmitProgress } from '../sse/pos-emitter';

export async function importPosService(file: string, user: AuthPayload) {
  const errors: any[] = [];
  const batch: ImportPosDTO[] = [];
  let imported = 0;
  let total = 0;
  let totalLines = 0;

  totalLines = await new Promise<number>((resolve, reject) => {
    let count = 0;
    fs.createReadStream(file)
      .pipe(csvParser())
      .on('data', () => count++)
      .on('end', () => resolve(count))
      .on('error', () => reject);
  });

  console.log(`======== TOTAL LINES: ${totalLines} =========`);

  const stream = fs
    .createReadStream(file)
    .pipe(csvParser({ mapHeaders: ({ header }) => header.trim() }))
    .pipe(
      createTransformPosStream(batch, errors, async () => {
        const count = await processBatchPos(batch);
        imported += count;
        total += count;
        batch.length = 0;
        const percent = Math.min(Math.round((imported / totalLines) * 100), 100);
        posEmitProgress({ percent });
        console.log(`COUNT: ${count}, IMPORTED: ${imported}, TOTAL: ${total}, PERCENT: ${percent}`);
      })
    );

  stream.on('data', (data) => console.log(`STREAMING: ${JSON.stringify(data)}`));

  stream.on('end', async () => {
    if (batch.length > 0) {
      const count = await processBatchPos(batch);
      imported += count;
      const percent = Math.min(Math.round((imported / totalLines) * 100), 100);
      posEmitProgress({ percent });

      console.log(`========= STREAM END ========= `);
      console.log(`========= TOTAL IMPORTED: ${imported} =========`);
    }

    await auditImport({
      file,
      user,
      imported,
      entity: 'POS',
      desc: 'Pontos de venda',
    });

    posEmitDone({ imported, total, errors });
  });

  stream.on('error', (err) => {
    posEmitError(err);
    console.log(`========= STREAM ERROR: ${err} =========`);
  });

  return { imported, errors };
}
