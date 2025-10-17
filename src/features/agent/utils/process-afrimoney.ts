import fs from 'fs';
import { Readable } from 'stream';
import csvParser from 'csv-parser';
import { normalizeDate } from './normalize';
import { AgentActivity } from '../../../@types/activies';

export async function processAfrimoney(file: Express.Multer.File): Promise<AgentActivity[]> {
  let stream: Readable;
  if (file.buffer) {
    stream = Readable.from(file.buffer.toString());
  } else if (file.path) {
    stream = fs.createReadStream(file.path);
  } else {
    return [];
  }

  return new Promise<AgentActivity[]>((resolve, reject) => {
    const agents: Record<string, AgentActivity> = {};

    stream
      .pipe(csvParser())
      .on('data', (row) => {
        const agentId = row['REMARKS']?.trim() || 'UNKNOWN';
        const deposit = parseFloat(row['TRANSFER_VALUE'] || '0');
        const debt = 0;
        const balance = deposit - debt;
        const date = normalizeDate(row['DATE']);

        if (!agents[agentId]) {
          agents[agentId] = {
            agentId,
            area: '',
            zone: '',
            actualBalance: '0',
            activities: [],
          };
        }

        agents[agentId].activities.push({
          debt: debt.toString(),
          deposit: deposit.toString(),
          balance: balance.toString(),
          date,
        });

        const total = agents[agentId].activities.reduce((acc, act) => acc + parseFloat(act.balance), 0);
        agents[agentId].actualBalance = total.toString();
      })
      .on('end', () => resolve(Object.values(agents)))
      .on('error', reject);
  });
}
