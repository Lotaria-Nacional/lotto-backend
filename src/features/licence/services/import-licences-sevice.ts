import z from 'zod';
import fs from 'fs';
import csvParser from 'csv-parser';
import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { AuthPayload } from '@lotaria-nacional/lotto';
import uploadCsvToImageKit from '../../../utils/upload-csv-to-image-kit';

interface ImportLicenceResponse {
  imported: number;
  errors: { row: any; error: any }[];
}

export const importLicenceSchema = z.object({
  reference: z.string(),
  admin_name: z.string().transform(val => val.charAt(0).toUpperCase() + val.slice(1).toLowerCase()),
  coordinates: z.string().optional(),
  district: z.string().optional(),
  emitted_at: z.coerce.date(),
  expires_at: z.coerce.date(),
  number: z.string(),
  description: z.string(),
  limit: z.coerce.number().default(1),
});

export type ImportLicenceDTO = z.infer<typeof importLicenceSchema>;

export async function importLicencesFromCsvService(
  filePath: string,
  user: AuthPayload
): Promise<ImportLicenceResponse> {
  const errors: { row: any; error: any }[] = [];
  const BATCH_SIZE = 500;
  const stream = fs.createReadStream(filePath).pipe(csvParser());

  let totalImported = 0;
  const licencesBatch: ImportLicenceDTO[] = [];

  for await (const row of stream) {
    try {
      const parsed = importLicenceSchema.parse({
        reference: row['REFERENCIA'],
        coordinates: row['COORDENADAS'],
        description: row['DESCRICAO'],
        emitted_at: row['DATA DE EMISSAO'],
        district: row['DISTRITO'],
        expires_at: row['DATA DE EXPIRACAO'],
        number: row['Nº DOCUMENTO'],
        limit: row['LIMITE'],
        admin_name: row['ADMINISTRACAO'],
      });

      licencesBatch.push(parsed);

      // processa batch
      if (licencesBatch.length >= BATCH_SIZE) {
        for (const licence of licencesBatch) {
          await prisma.licence.upsert({
            where: { reference: licence.reference },
            create: licence,
            update: licence,
          });
        }
        totalImported += licencesBatch.length;
        licencesBatch.length = 0;
      }
    } catch (err: any) {
      errors.push({ row, error: err.errors || err.message });
      console.error(err);
    }
  }

  // finaliza batch pendente
  if (licencesBatch.length > 0) {
    for (const licence of licencesBatch) {
      await prisma.licence.upsert({
        where: { reference: licence.reference },
        create: licence,
        update: licence,
      });
    }
    totalImported += licencesBatch.length;
  }

  const url = await uploadCsvToImageKit(filePath);
  if (totalImported > 0) {
    await prisma.$transaction(async tx => {
      await audit(tx, 'IMPORT', {
        user,
        before: null,
        after: null,
        entity: 'LICENCE',
        description: `Importou ${totalImported} licenças`,
        metadata: { file: url },
      });
    });
  }

  return { errors, imported: totalImported };
}
