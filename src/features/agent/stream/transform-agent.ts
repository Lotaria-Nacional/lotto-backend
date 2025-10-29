import { Transform } from 'stream';
import { ZodError } from 'zod';
import { ImportAgentDTO, importAgentsSchema } from '../validation/import-agent-schema';
import { CHUNK_SIZE } from '../utils/process-batch-agents';

export function createTransformAgentStream(batch: ImportAgentDTO[], errors: any[], onBatchReady: () => Promise<void>) {
  return new Transform({
    objectMode: true,

    async transform(row, _, callback) {
      try {
        const input: ImportAgentDTO = {
          id_reference: row['ID'],
          name: row['NOME'],
          last_name: row['SOBRENOME'],
          gender: row['GENERO'],
          training_date: row['DATA  DE FORMACAO'],
          status: row['ESTADO'],
          phone_number: row['Nº TELEFONE'],
          bi_number: row['Nº DO BI'],
          area: row['AREA'],
          zone: row['ZONA'],
        };

        const parsed = importAgentsSchema.parse(input);
        batch.push(parsed);

        if (batch.length >= CHUNK_SIZE) {
          await onBatchReady();
        }

        callback();
      } catch (err) {
        console.error(err);
        if (err instanceof ZodError) {
          errors.push({
            row,
            error: err.issues.map((issue) => ({
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
