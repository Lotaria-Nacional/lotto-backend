import fs from 'fs';
import dayjs from 'dayjs';
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
              const date = row['DATE'];
              const formattedAfrimoneyDate = dayjs(date, 'M/D/YY H:mm', true).format('DD-MM-YYYY');

              await prisma.afrimoneyActivity.create({
                data: {
                  date: formattedAfrimoneyDate || null,
                  accountId: row['ACCOUNT_ID'] || null,
                  remarks: row['REMARKS']?.trim() || null,
                  transferValue: row['TRANSFER_VALUE'] || null,
                },
              });
            }

            if (type === 'KORAL-PLAY') {
              const date = row['DATE'];
              const formattedKoralDate = dayjs(date, 'M/D/YYYY', true).format('DD-MM-YYYY');
              const groupName = row['GROUPNAME']?.trim() || '';

              // Ignorar SEDE NACIONAL
              if (groupName.toUpperCase() === 'SEDE NACIONAL') return;

              // Apenas guardar se for ZONA X (1,2,3,...) ou AGÊNCIAS
              const isZona = /^ZONA\s*\d+$/i.test(groupName);
              const isAgencia = /^AGENCIAS?$/i.test(groupName);

              if (!isZona && !isAgencia) return;

              await prisma.koralplayActivity.create({
                data: {
                  date: formattedKoralDate || null,
                  groupName,
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
