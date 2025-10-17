import fs from 'fs';
import { ZodError } from 'zod';
import csvParser from 'csv-parser';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { auditImport } from '../../../utils/import-utils';
import { processBatchTerminals } from '../utils/process-batch-terminals';
import { ImportTerminalsDTO, importTerminalsSchema } from '../validation/import-terminal-schema';

export async function importTerminalsFromCsvService(file: string, user: AuthPayload) {
  const errors: any[] = [];
  let imported = 0;
  const BATCH_SIZE = 500;

  const stream = fs.createReadStream(file).pipe(csvParser());
  const terminalsBatch: ImportTerminalsDTO[] = [];

  for await (const row of stream) {
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

      terminalsBatch.push(parsed);

      if (terminalsBatch.length >= BATCH_SIZE) {
        imported += await processBatchTerminals(terminalsBatch);
      }
    } catch (err: any) {
      console.log(err);
      if (err instanceof ZodError) {
        errors.push({
          row,
          error: err.issues.map(issue => ({
            campo: issue.path.join(','),
            menssagem: issue.message,
          })),
        });
      } else {
        errors.push({ row, error: (err as any).message || err });
      }
    }
  }

  if (terminalsBatch.length > 0) {
    imported += await processBatchTerminals(terminalsBatch);
  }

  await auditImport({ file, user, imported, entity: 'TERMINAL', desc: 'terminais' });

  return { errors, imported };
}
