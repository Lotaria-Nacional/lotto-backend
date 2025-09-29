import fs from 'fs';
import z from 'zod';
import csvParser from 'csv-parser';
import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { processPosBatch } from '../utils/process-pos-batch';
import uploadCsvToImageKit from '../../../utils/upload-csv-to-image-kit';

interface ImportPosResponse {
  imported: number;
  errors: { row: any; error: any }[];
}

export async function importPosFromCsvService(filePath: string, user: AuthPayload): Promise<ImportPosResponse> {
  const posBatch: ImportPosDTO[] = [];
  const errors: any[] = [];
  const BATCH_SIZE = 500;
  let imported = 0;

  const stream = fs
    .createReadStream(filePath)
    .pipe(csvParser({ mapHeaders: ({ header }) => header.replace(/^\uFEFF/, '').trim() }));

  for await (const row of stream) {
    try {
      const input: ImportPosDTO = {
        idRevendedor: row['ID REVENDEDOR'],
        provincia: row['PROVINCIA'],
        administracao: row['ADMINISTRACAO'],
        cidade: row['CIDADE'],
        area: row['AREA'],
        zona: row['ZONA'],
        estado: row['ESTADO'],
        tipologia: row['TIPOLOGIA'],
        licenca: row['LICENCA'],
        coordenadas: row['COORDENADAS'],
      };

      const parsed = importPosSchema.parse(input);

      posBatch.push(parsed);

      if (posBatch.length >= BATCH_SIZE) {
        await processPosBatch({ posList: posBatch, user, errors });
        imported += posBatch.length;
        posBatch.length = 0;
      }
    } catch (err: any) {
      errors.push({ row, error: err.errors || err.message });
    }
  }

  if (posBatch.length > 0) {
    await processPosBatch({ posList: posBatch, user, errors });
    imported += posBatch.length;
  }

  const url = await uploadCsvToImageKit(filePath);

  if (imported > 0) {
    await prisma.$transaction(async tx => {
      await audit(tx, 'IMPORT', {
        user,
        entity: 'POS',
        before: null,
        after: null,
        description: `Importou ${imported} pontos de venda`,
        metadata: { file: url },
      });
    });
  }

  return { errors, imported };
}

const importPosSchema = z.object({
  idRevendedor: z.coerce.number().int().optional(),
  provincia: z
    .string()
    .transform(val => {
      if (!val) return undefined;
      const trimmed = val.trim().normalize('NFC').toLowerCase();
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    })
    .optional(),

  administracao: z
    .string()
    .optional()
    .transform(val => {
      if (!val) return undefined;
      const trimmed = val.trim().toLowerCase();
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    }),

  cidade: z
    .string()
    .optional()
    .transform(val => {
      if (!val) return undefined;
      const trimmed = val.trim().normalize('NFC').toLowerCase();
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    }),
  area: z
    .string()
    .optional()
    .transform(val => {
      if (!val) return undefined;
      // Converte para maiúsculas e remove espaços extras
      const normalized = val.trim().toUpperCase();
      // Remove a palavra "AREA" se existir e captura a letra seguinte
      const match = normalized.match(/(?:AREA\s*)?([A-D])/);
      return match ? match[1] : undefined;
    }),
  zona: z
    .string()
    .optional()
    .transform(val => {
      if (!val) return undefined;
      // Remove espaços e deixa maiúsculas (opcional)
      const normalized = val.trim().toUpperCase();
      // Captura o número que vem depois de "ZONA"
      const match = normalized.match(/(?:ZONA\s*)?(\d+)/);
      return match ? parseInt(match[1], 10) : undefined;
    }),
  estado: z.string().optional(),
  tipologia: z.string().optional(),
  licenca: z.string().optional(),
  coordenadas: z.string().optional(),
});

export type ImportPosDTO = z.infer<typeof importPosSchema>;
