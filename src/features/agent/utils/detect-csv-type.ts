import fs from 'fs';
import { Readable } from 'stream';
import csvParser from 'csv-parser';

type CsvType = 'AFRIMONEY' | 'KORAL-PLAY' | 'UNKNOWN';

export type AgentActivity = {
  agentId: string;
  area: string;
  zone: string;
  actualBalance: string;
  activities: {
    debt: string;
    deposit: string;
    balance: string;
  }[];
};

export type AgentActivityType = AgentActivity[];

// Detecta o tipo de CSV (pelos headers)
export async function detectCsvType(file: Express.Multer.File): Promise<CsvType> {
  return new Promise((resolve, reject) => {
    let detected: CsvType = 'UNKNOWN';

    let stream: Readable;
    if (file.buffer) {
      stream = Readable.from(file.buffer.toString());
    } else if (file.path) {
      stream = fs.createReadStream(file.path);
    } else {
      return resolve('UNKNOWN');
    }

    stream
      .pipe(csvParser())
      .on('headers', (headers: string[]) => {
        if (headers.includes('TRANSFER_DATE') && headers.includes('REMARKS')) {
          detected = 'AFRIMONEY';
        } else if (headers.includes('STAFFREFERENCE') && headers.includes('GGR_AMOUNT')) {
          detected = 'KORAL-PLAY';
        }
        stream.destroy();
        resolve(detected);
      })
      .on('error', reject);
  });
}
