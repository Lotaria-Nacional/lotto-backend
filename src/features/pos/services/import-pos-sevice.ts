import fs from 'fs';
import csvParser from 'csv-parser';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { ImportPosDTO, importPosSchema } from '../validation/import-pos-schema';
import { auditImport } from '../../../utils/import-utils';
import { processBatchPos } from '../utils/process-batch-pos';
import z from 'zod';

export const BATCH_SIZE = 500;

export async function importPosFromCsvService(filePath: string, user: AuthPayload) {
  const errors: any[] = [];
  let imported = 0;
  const posBatch: ImportPosDTO[] = [];

  const stream = fs.createReadStream(filePath).pipe(csvParser());

  for await (const row of stream) {
    // Transformar CSV para DTO
    const input: ImportPosDTO = {
      agent_id_reference: row['ID REVENDEDOR'],
      province: row['PROVINCIA'],
      admin_name: row['ADMINISTRACAO'],
      city: row['CIDADE'],
      area: row['AREA'],
      zone: row['ZONA'],
      status: row['ESTADO'],
      type_name: row['TIPOLOGIA'],
      licence: getLicenceColumn(row),
      coordinates: row['coordenadas'],
    };

    // Parse seguro (nunca lança)
    const parsed = safeParse(importPosSchema, input);
    posBatch.push(parsed);

    if (posBatch.length >= BATCH_SIZE) {
      imported += await processBatchPos(posBatch);
    }
  }

  // Importar o que sobrou
  if (posBatch.length > 0) {
    imported += await processBatchPos(posBatch);
  }

  // Auditoria
  await auditImport({ file: filePath, user, imported, entity: 'POS', desc: 'pontos de venda' });

  return { total: imported + errors.length, errors, imported, ignored: errors.length };
}

async function sendSMS(message: string) {
  // Exemplo: podes usar Twilio, Nexmo ou outro serviço
  console.log(`SMS para Paulo Luguenda: ${message}`);
}

function getLicenceColumn(row: Record<string, any>) {
  const key = Object.keys(row).find((k) =>
    k
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove acentos
      .trim()
      .toLowerCase()
      .includes('licenc')
  );
  return key ? row[key]?.toString().trim() || undefined : undefined;
}

function safeParse<T>(schema: z.ZodSchema<T>, data: any): T {
  try {
    return schema.parse(data);
  } catch {
    const output: Partial<T> = {};
    Object.keys(data).forEach((key) => {
      // @ts-ignore
      output[key] = data[key] ?? null;
    });
    return output as T;
  }
}
