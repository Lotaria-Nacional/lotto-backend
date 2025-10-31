import fs from 'fs';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import { ExpressFile } from '../services/make-reconciliation-service';

export type FileType = 'afrimoney' | 'koral-play' | 'unknown';

export const getFileType = (file: ExpressFile): Promise<FileType> => {
  return new Promise((resolve, reject) => {
    let fileType: FileType = 'unknown';
    let stream: Readable;

    if (file.buffer) {
      stream = Readable.from(file.buffer.toString());
    } else if (file.path) {
      stream = fs.createReadStream(file.path);
    } else {
      return reject('unknown');
    }

    stream.pipe(csvParser()).on('headers', (headers: string[]) => {
      if (headers.includes('remarks')) {
        fileType = 'afrimoney';
      } else if (headers.includes('Sender_StaffReference')) {
        fileType = 'koral-play';
      }
      stream.destroy();
      resolve(fileType);
    });

    stream.on('error', reject);
  });
};
