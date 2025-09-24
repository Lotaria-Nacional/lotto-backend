import fs from 'fs';
import csvParser from 'csv-parser';
import prisma from '../../../lib/prisma';
import { AuthPayload, CreateSimCardDTO, createSimCardSchema } from '@lotaria-nacional/lotto';
import { audit } from '../../../utils/audit-log';

interface ImportSimCardResponse {
  imported: number;
  errors: { row: any; errors: any }[];
}

export async function importSimCardsFromCsvService(
  filePath: string,
  user: AuthPayload
): Promise<ImportSimCardResponse> {
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

  await prisma.$transaction(async (tx) => {
    await audit(tx, 'IMPORT', {
      entity: 'SIM_CARD',
      user,
      after: null,
      before: null,
      description: `Importou ${simCardsBatch.length + errors.length} sim cards no inventário`,
    });
  });

  return { errors, imported: simCardsBatch.length + errors.length };
}
