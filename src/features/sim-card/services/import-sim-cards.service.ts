import fs from 'fs';
import csvParser from 'csv-parser';
import prisma from '../../../lib/prisma';
import { CreateSimCardDTO, createSimCardSchema } from '@lotaria-nacional/lotto';

interface ImportSimCardResponse {
  imported: number;
  errors: { row: any; errors: any }[];
}

export async function importSimCardsFromCsvService(filePath: string): Promise<ImportSimCardResponse> {
  const simCardsBatch: any[] = [];
  const errors: any[] = [];
  const BATCH_SIZE = 500;

  const stream = fs.createReadStream(filePath).pipe(csvParser());

  for await (const row of stream) {
    try {
      const input: CreateSimCardDTO = {
        number: row.number,
        pin: row.pin,
        puk: row.puk,
        arrived_at: new Date(row.arrived_at),
      };

      const parsed = createSimCardSchema.parse(input);
      simCardsBatch.push(parsed);

      if (simCardsBatch.length >= BATCH_SIZE) {
        await prisma.simCard.createMany({
          data: simCardsBatch,
          skipDuplicates: true,
        });

        simCardsBatch.length = 0;
      }
    } catch (err: any) {
      errors.push({ row, error: err.errors || err.message });
    }
  }

  if (simCardsBatch.length > 0) {
    await prisma.simCard.createMany({
      data: simCardsBatch,
      skipDuplicates: true,
    });
  }

  return { errors, imported: simCardsBatch.length + errors.length };
}
