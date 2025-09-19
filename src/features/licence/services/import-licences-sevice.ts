import z from 'zod';
import fs from 'fs';
import csvParser from 'csv-parser';
import prisma from '../../../lib/prisma';
import { CreateLicenceDTO, createLicenceSchema } from '@lotaria-nacional/lotto';

interface ImportLicenceResponse {
  imported: number;
  errors: { row: any; error: any }[];
}

export async function importLicencesFromCsvService(filePath: string): Promise<ImportLicenceResponse> {
  const licencesBatch: any[] = [];
  const errors: any[] = [];
  const BATCH_SIZE = 500;

  const stream = fs.createReadStream(filePath).pipe(csvParser());

  for await (const row of stream) {
    try {
      const input: Partial<CreateLicenceDTO> & { reference: string } = {
        reference: row.reference,
        coordinates: row.coordinates,
        description: row.description,
        emitted_at: new Date(row.emitted_at),
        expires_at: new Date(row.expires_at),
        number: row.number,
        limit: Number(row.limit),
        admin_name: row.admin_name,
      };

      const parsed = createLicenceSchema.safeExtend({ reference: z.string() }).parse(input);
      licencesBatch.push(parsed);

      if (licencesBatch.length >= BATCH_SIZE) {
        await prisma.licence.createMany({
          data: licencesBatch,
          skipDuplicates: true,
        });

        licencesBatch.length = 0;
      }
    } catch (err: any) {
      errors.push({ row, error: err.errors || err.message });
      console.error(err);
    }
  }

  if (licencesBatch.length > 0) {
    await prisma.licence.createMany({
      data: licencesBatch,
      skipDuplicates: true,
    });
  }

  return { errors, imported: licencesBatch.length + errors.length };
}
