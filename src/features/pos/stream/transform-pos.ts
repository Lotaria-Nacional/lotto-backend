import { Transform } from 'stream';
import { ZodError } from 'zod';
import { ImportPosDTO, importPosSchema } from '../validation/import-pos-schema';
import { CHUNK_SIZE } from '../../agent/utils/process-batch-agents';

export function createTransformPosStream(batch: ImportPosDTO[], errors: any[], onBatchReady: () => Promise<void>) {
  return new Transform({
    objectMode: true,
    async transform(row, _, callback) {
      try {
        const input: ImportPosDTO = {
          id: row['ID'],
          agent_id_reference: row['ID REVENDEDOR'],
          province: row['PROVINCIA'],
          admin_name: row['ADMINISTRACAO'],
          description: row['DESCRICAO'],
          city: row['CIDADE'],
          area: row['AREA'],
          zone: row['ZONA'],
          status: row['ESTADO'],
          type_name: row['TIPOLOGIA'],
          licence: getPosColumn(row),
          coordinates: row['COORDENADAS'],
        };

        const parsed = importPosSchema.parse(input);
        batch.push(parsed);

        if (batch.length >= CHUNK_SIZE) {
          await onBatchReady();
        }

        callback();
      } catch (err) {
        console.error(`TRANSFORM POS STREAM ERROR: ${err}`);
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

export function getPosColumn(row: Record<string, any>) {
  const key = Object.keys(row).find(k =>
    k
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove acentos
      .trim()
      .toLowerCase()
      .includes('licenc')
  );
  return key ? row[key]?.toString().trim() || undefined : undefined;
}
