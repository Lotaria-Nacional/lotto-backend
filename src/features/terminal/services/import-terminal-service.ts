import fs from 'fs';
import z, { ZodError } from 'zod';
import csvParser from 'csv-parser';
import { parseImportedDate } from '../../../utils/import-utils';
import { processBatchTerminals } from '../../../utils/process-batch';
import { AuthPayload, TerminalStatus } from '@lotaria-nacional/lotto';

export async function importTerminalsFromCsvService(file: string, user: AuthPayload) {
  const errors: any[] = [];
  let imported = 0;
  const BATCH_SIZE = 500;

  const stream = fs.createReadStream(file).pipe(csvParser());
  const terminalsBatch: ImportTerminalsDTO[] = [];

  for await (const row of stream) {
    try {
      const input: ImportTerminalsDTO = {
        idReference: row['ID REVENDEDOR'],
        serialNumber: row['Nº DE SERIE DO TERMINAL'],
        simCardNumber: row['Nº DO CARTAO UNITEL'],
        pin: row['PIN'],
        puk: row['PUK'],
        status: row['ESTADO'],
        chipSerialNumber: row['Nº DE SERIE DO CHIP'],
        deviceId: row['DEVICE ID'],
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
          error: err.issues.map((issue) => ({
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

  return { errors, imported };
}

const importTerminalsSchema = z.object({
  idReference: z
    .string()
    .transform((val) => {
      // Extrai apenas dígitos
      const match = val.match(/^\d+$/);
      return match ? Number(match[0]) : null;
    })
    .nullable()
    .optional(),
  serialNumber: z.string().trim(),
  deviceId: z.string().trim().optional(),
  simCardNumber: z.string().trim().optional(),
  pin: z.string().trim().optional(),
  puk: z.string().trim().optional(),
  status: z
    .string()
    .transform((val): TerminalStatus | null => {
      const v = val.toLowerCase().trim();
      switch (v) {
        case 'em campo':
          return 'on_field';
        case 'pronto':
          return 'ready';
        case 'inventário':
          return 'stock';
        case 'avariado':
          return 'broken';
        default:
          return 'ready';
      }
    })
    .optional(),
  chipSerialNumber: z.string().trim().optional(),
  activatedAt: z.transform(parseImportedDate),
});

export type ImportTerminalsDTO = z.infer<typeof importTerminalsSchema>;
