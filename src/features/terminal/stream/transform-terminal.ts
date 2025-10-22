import { Transform } from 'node:stream';
import { ImportTerminalsDTO, importTerminalsSchema } from '../validation/import-terminal-schema';
import { ZodError } from 'zod';
import { CHUNK_SIZE } from '../../agent/utils/process-batch-agents';

export function createTransformTerminalStream(
  batch: ImportTerminalsDTO[],
  errors: any[],
  onBatchReady: () => Promise<void>
) {
  return new Transform({
    objectMode: true,
    async transform(row, _, callback) {
      try {
        const input: ImportTerminalsDTO = {
          agent_id_reference: row['ID REVENDEDOR'],
          serial_number: row['Nº DE SERIE DO TERMINAL'],
          sim_card_number: row['Nº DO CARTAO UNITEL'],
          pin: row['PIN'],
          puk: row['PUK'],
          status: row['ESTADO'],
          chip_serial_number: row['Nº DE SERIE DO CHIP'],
          device_id: row['DEVICE ID'],
          activatedAt: row['DATA DA ACTIVACAO'],
        };

        const parsed = importTerminalsSchema.parse(input);
        batch.push(parsed);

        if (batch.length >= CHUNK_SIZE) {
          await onBatchReady();
        }

        callback();
      } catch (err) {
        console.error('Erro ao processar linha:', row, err);

        if (err instanceof ZodError) {
          errors.push({
            row,
            error: err.issues.map((issue) => ({
              campo: issue.path.join(','),
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
