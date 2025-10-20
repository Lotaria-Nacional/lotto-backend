import fs from 'fs';
import csvParser from 'csv-parser';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { ImportAgentDTO } from '../validation/import-agent-schema';
import { createTransformAgentStream } from '../stream/transform-agent';
import { processBatchAgents } from '../utils/process-batch-agents';
import { emitDone, emitError, emitProgress } from '../sse/agent-progress-emitter';
import { updateIdReference } from '../utils/update-id-reference';
import { auditImport } from '../../../utils/import-utils';

export async function importAgentsServices(file: string, user: AuthPayload) {
  const errors: any[] = [];
  const batch: ImportAgentDTO[] = [];
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
      createTransformAgentStream(batch, errors, async () => {
        const count = await processBatchAgents(batch);
        imported += count;
        total += count;
        batch.length = 0;
        const percent = Math.min(Math.round((imported / totalLines) * 100), 100);
        emitProgress({ percent, imported, totalLines });
        console.log(`COUNT: ${count}, IMPORTED: ${imported}, TOTAL: ${total}, PERCENT: ${percent}`);
      })
    );

  stream.on('data', data => console.log(`STREAMING: ${JSON.stringify(data)}`));

  stream.on('end', async () => {
    if (batch.length > 0) {
      const count = await processBatchAgents(batch);
      imported += count;
      const percent = Math.min(Math.round((imported / totalLines) * 100), 100);
      emitProgress({ percent, imported, totalLines });
    }
    emitDone({ imported, total: totalLines, errors });
    console.log(`========= STREAM END ========= `);
    console.log(`========= TOTAL IMPORTED: ${imported} =========`);

    await auditImport({
      file,
      user,
      imported,
      entity: 'AGENT',
      desc: `Importação de agentes (${imported}})`,
    });
  });

  stream.on('error', err => {
    emitError(err);
    console.log(`========= STREAM ERROR: ${err} =========`);
  });

  await updateIdReference();
  return { imported, errors };
}
