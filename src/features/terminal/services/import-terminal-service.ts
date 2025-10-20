import fs from 'fs';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { ImportTerminalsDTO } from '../validation/import-terminal-schema';
import csvParser from 'csv-parser';
import { createTransformTerminalStream } from '../stream/transform-terminal';
import { processBatchTerminals } from '../utils/process-batch-terminals';
import { terminalEmitDone, terminalEmitError, terminalEmitProgress } from '../sse/terminal-progress-emitter';
import { auditImport } from '../../../utils/import-utils';

export async function importTerminalsService(file: string, user: AuthPayload) {
  const errors: any = [];
  const batch: ImportTerminalsDTO[] = [];
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
      createTransformTerminalStream(batch, errors, async () => {
        const { count, errors: err } = await processBatchTerminals(batch);
        imported += count;
        total += count;
        batch.length = 0;
        const percent = Math.min(Math.round((imported / totalLines) * 100), 100);
        terminalEmitProgress({ percent });
        console.log(`COUNT: ${count}, IMPORTED: ${imported}, TOTAL: ${total}, PERCENT: ${percent}`);
      })
    );

  stream.on('data', data => console.log(`STREAMING: ${JSON.stringify(data)}`));

  stream.on('end', async () => {
    if (batch.length > 0) {
      const { count, errors: err } = await processBatchTerminals(batch);
      imported += count;
      const percent = Math.min(Math.round((imported / totalLines) * 100), 100);
      terminalEmitProgress({ percent });
    }
    await auditImport({
      file,
      user,
      imported,
      entity: 'TERMINAL',
      desc: `Importação de terminais (${imported})`,
    });

    terminalEmitDone({ imported, total: totalLines, errors });
    console.log(`========= STREAM END ========= `);
    console.log(`========= TOTAL IMPORTED: ${imported} =========`);
  });

  stream.on('error', err => {
    terminalEmitError(err);
    console.log(`========= STREAM ERROR: ${err} =========`);
  });

  return { imported, errors };
}
