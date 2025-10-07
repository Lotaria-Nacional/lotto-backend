import fs from 'fs';
import { Readable } from 'stream';
import csvParser from 'csv-parser';
import prisma from '../../../lib/prisma';
import { detectCsvType } from '../utils/detect-csv-type';

export async function importActitiviesService(
  files: Express.Multer.File[],
  onProgress?: (percent: number) => void
): Promise<void> {
  let totalRecords = 0;
  let savedRecords = 0;

  for (const file of files) {
    const buffer = file.buffer?.toString() ?? fs.readFileSync(file.path, 'utf8');
    totalRecords += buffer.split('\n').length - 1;
  }

  for (const file of files) {
    const type = await detectCsvType(file);

    let stream: Readable;
    if (file.buffer) stream = Readable.from(file.buffer.toString());
    else if (file.path) stream = fs.createReadStream(file.path);
    else continue;

    await new Promise<void>((resolve, reject) => {
      stream
        .pipe(csvParser())
        .on('data', async (row) => {
          try {
            if (type === 'AFRIMONEY') {
              await prisma.afrimoneyActivity.create({
                data: {
                  accountId: row['ACCOUNT_ID'] || null,
                  remarks: row['REMARKS']?.trim() || null,
                  transferDate: row['TRANSFER_DATE'] || null,
                  transferValue: row['TRANSFER_VALUE'] || null,
                },
              });
            }

            if (type === 'KORAL-PLAY') {
              await prisma.koralplayActivity.create({
                data: {
                  date: row['DATE'] || null,
                  groupName: row['GROUPNAME'] || null,
                  ggrAmount: row['GGR_AMOUNT'] || null,
                  staffReference: row['STAFFREFERENCE']?.trim() || null,
                },
              });
            }

            savedRecords++;
            if (onProgress) {
              const percent = Math.min(100, Math.round((savedRecords / totalRecords) * 100));
              onProgress(percent);
            }
          } catch (err) {
            console.error('Erro ao inserir linha:', err);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });
  }

  if (onProgress) onProgress(100);
}
