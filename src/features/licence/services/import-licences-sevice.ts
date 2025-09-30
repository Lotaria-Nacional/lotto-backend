import z from 'zod';
import fs from 'fs';
import csvParser from 'csv-parser';
import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { AuthPayload } from '@lotaria-nacional/lotto';
import uploadCsvToImageKit from '../../../utils/upload-csv-to-image-kit';
import { transformDate } from '../../../utils/date';
import { createSlug } from '../../../utils/slug';

interface ImportLicenceResponse {
  imported: number;
  errors: { row: any; error: any }[];
}

export const importLicenceSchema = z.object({
  reference: z.string(),
  admin_name: z.string().transform(createSlug).optional(),
  coordinates: z.string().optional(),
  district: z.string().optional(),
  emitted_at: z
    .string()
    .optional()
    .transform(val => {
      if (!val || val.trim() === '') {
        // Gera uma data aleatória caso não exista
        const year = new Date().getFullYear();
        const month = Math.floor(Math.random() * 12);
        const day = Math.floor(Math.random() * 28) + 1;
        return new Date(year, month, day);
      }

      let day: number, month: number, year: number;

      if (/^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(val)) {
        // YYYY-MM-DD ou YYYY/MM/DD
        [year, month, day] = val.split(/[-/]/).map(Number);
      } else if (/^\d{1,2}[\/-]\d{1,2}[\/-]\d{4}$/.test(val)) {
        // D/M/YYYY ou DD/MM/YYYY ou D/MM/YYYY etc
        [day, month, year] = val.split(/[-/]/).map(Number);
      } else {
        // formato inválido: gera data aleatória
        const currentYear = new Date().getFullYear();
        const randomMonth = Math.floor(Math.random() * 12);
        const randomDay = Math.floor(Math.random() * 28) + 1;
        return new Date(currentYear, randomMonth, randomDay);
      }

      return new Date(year, month - 1, day);
    }),
  expires_at: z.string().optional().transform(transformDate),
  number: z.string(),
  description: z.string(),
  limit: z.coerce.number().default(10),
});

export type ImportLicenceDTO = z.infer<typeof importLicenceSchema>;

export async function importLicencesFromCsvService(
  filePath: string,
  user: AuthPayload
): Promise<ImportLicenceResponse> {
  const errors: { row: any; error: any }[] = [];
  const BATCH_SIZE = 500;
  const stream = fs
    .createReadStream(filePath)
    .pipe(csvParser({ mapHeaders: ({ header }) => header.replace(/^\uFEFF/, '').trim() }));

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
            create: {
              reference: licence.reference,
              admin_name: licence.admin_name,
              number: licence.number,
              description: licence.description,
              emitted_at: licence.emitted_at,
              coordinates: licence.coordinates,
              expires_at: licence.expires_at,
              limit: licence.limit,
            },
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
