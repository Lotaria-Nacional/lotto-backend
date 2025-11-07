import { ZodError } from 'zod';
import { Transform } from 'node:stream';
import { CHUNK_SIZE } from '../../agent/utils/process-batch-agents';
import { ImportTerminalsDTO, importTerminalsSchema } from '../validation/import-terminal-schema';

export function createTransformTerminalStream(
  batch: ImportTerminalsDTO[],
  errors: any[],
  onBatchReady: () => Promise<void>
) {
  const serialSet = new Set<string>(); // global no stream
  let line = 0;

  return new Transform({
    objectMode: true,
    async transform(row, _, callback) {
      line++;
      try {
        const input: ImportTerminalsDTO = {
          agent_id_reference: row['ID REVENDEDOR']?.trim(),
          serial_number: row['Nº DE SERIE DO TERMINAL']?.trim(),
          sim_card_number: row['Nº DO CARTAO UNITEL']?.trim(),
          pin: row['PIN']?.trim(),
          puk: row['PUK']?.trim(),
          status: row['ESTADO']?.trim(),
          chip_serial_number: row['Nº DE SERIE DO CHIP']?.trim(),
          device_id: row['DEVICE ID']?.trim(),
          obs: row['NOTA']?.trim(),
          activatedAt: row['DATA DA ACTIVACAO']?.trim(),
        };
        const parsed = importTerminalsSchema.parse(input);

        if (serialSet.has(parsed.serial_number)) {
          console.log(`⚠️ Duplicado ignorado (linha ${line}): ${parsed.serial_number}`);
          return callback();
        }

        serialSet.add(parsed.serial_number);

        batch.push(parsed);

        if (batch.length >= CHUNK_SIZE) {
          await onBatchReady();
        }

        callback();
      } catch (err) {
        console.error(`Erro ao processar linha ${line}:`, row, err);

        if (err instanceof ZodError) {
          errors.push({
            row,
            error: err.issues.map(issue => ({
              field: issue.path.join(','),
              message: issue.message,
            })),
          });
        } else {
          errors.push({ row, error: (err as any).message || err });
        }
        callback();
      }
    },

    async flush(callback) {
      if (batch.length > 0) {
        await onBatchReady();
        batch.length = 0; // ✅ segurança
      }
      callback();
    },
  });
}
