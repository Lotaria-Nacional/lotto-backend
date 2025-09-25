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

export async function importLicencesFromCsvService(
  filePath: string,
  user: AuthPayload
): Promise<ImportLicenceResponse> {
  const licencesBatch: any[] = [];
  const errors: any[] = [];
  const BATCH_SIZE = 500;

  const stream = fs.createReadStream(filePath).pipe(csvParser());

  return await prisma.$transaction(async tx => {
    for await (const row of stream) {
      try {
        const input: Partial<ImportLicenceDTO> & { reference: string } = {
          reference: row['REFERENCIA'],
          coordinates: row['COORDENADAS'],
          description: row['DESCRICAO'],
          emitted_at: row['DATA DE EMISSAO'],
          district: row['DISTRITO'],
          expires_at: row['DATA DE EXPIRACAO'],
          number: row['Nº DOCUMENTO'],
          limit: row['LIMITE'],
          admin_name: row['ADMINISTRACAO'],
        };

        const parsed = importLicenceSchema.parse(input);

        console.log(parsed.admin_name);

        licencesBatch.push(parsed);

        if (licencesBatch.length >= BATCH_SIZE) {
          await tx.licence.createMany({
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
      await tx.licence.createMany({
        data: licencesBatch,
        skipDuplicates: true,
      });
    }

    const url = await uploadCsvToImageKit(filePath);

    await audit(tx, 'IMPORT', {
      user,
      before: null,
      after: null,
      entity: 'LICENCE',
      description: `Importou ${licencesBatch.length} licenças`,
      metadata: {
        file: url,
      },
    });

    return { errors, imported: licencesBatch.length + errors.length };
  });
}

// REFERENCIA |	ADMINISTRACAO |	DISTRITO
// DATA DE EMISSAO |	DATA DE EXPIRACAO
// Nº DOCUMENTO |	DESCRICAO |	COORDENADAS |	LIMITE

const importLicenceSchema = z.object({
  reference: z.string(),
  admin_name: z.string().transform(val => {
    const v = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
    return v;
  }),
  coordinates: z.string().optional(),
  district: z.string().optional(),
  emitted_at: z.coerce.date(),
  expires_at: z.coerce.date(),
  number: z.string(),
  description: z.string(),
  limit: z.coerce.number().default(1),
});

export type ImportLicenceDTO = z.infer<typeof importLicenceSchema>;
