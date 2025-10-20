import { Transform } from 'stream';
import { ZodError } from 'zod';
import { ImportLicenceDTO, importLicenceSchema } from '../validation/import-licence-schema';
import { CHUNK_SIZE } from '../../agent/utils/process-batch-agents';

export function createTransformLicenceStream(
  batch: ImportLicenceDTO[],
  errors: any[],
  onBatchReady: () => Promise<void>
) {
  return new Transform({
    objectMode: true,
    async transform(row, _, callback) {
      try {
        const input: ImportLicenceDTO = {
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
        batch.push(parsed);

        if (batch.length >= CHUNK_SIZE) {
          await onBatchReady();
        }

        callback();
      } catch (err) {
        console.error(`TRANSFORM LICENCES ERROR: ${err}`);
        if (err instanceof ZodError) {
          errors.push({
            row,
            error: err.issues.map(issue => ({
              campo: issue.path.join('.'),
              mensagem: issue.message,
            })),
          });
        } else {
          errors.push({ row, error: (err as any).message || err });
        }
        callback();
      }
    },
  });
}
