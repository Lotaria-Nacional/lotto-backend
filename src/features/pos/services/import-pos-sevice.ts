import fs from 'fs';
import csvParser from 'csv-parser';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { processBatchPos } from '../utils/process-batch-pos';
import { ImportPosDTO, importPosSchema } from '../validation/import-pos-schema';

export async function importPosFromCsvService(filePath: string, user: AuthPayload) {
  const errors: any[] = [];
  let imported = 0;
  const BATCH_SIZE = 500;

  const stream = fs.createReadStream(filePath).pipe(csvParser());
  const posBatch: ImportPosDTO[] = [];

  for await (const row of stream) {
    try {
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

      const parsed = importPosSchema.parse(input);

      posBatch.push(parsed);

      if (posBatch.length >= BATCH_SIZE) {
        imported += await processBatchPos(posBatch);
      }
    } catch (err: any) {
      const missingFields = Array.isArray(err.errors) ? err.errors.map((e: any) => e.message) : [err.message];

      errors.push({ row, error: missingFields.join(', ') });

      // Enviar SMS apenas para campos obrigatórios faltantes
      if (missingFields.length > 0) {
        const msg = `POS ignorado: ${missingFields.join(', ')}`;
        await sendSMS(msg); // envia SMS ao utilizador
      }
    }
  }

  if (posBatch.length > 0) {
    imported += await processBatchPos(posBatch);
  }

  return { total: imported + errors.length, errors, imported, ignored: errors.length };
}

async function sendSMS(message: string) {
  // Exemplo: podes usar Twilio, Nexmo ou outro serviço
  console.log(`SMS para Paulo Luguenda: ${message}`);
}

function getLicenceColumn(row: Record<string, any>) {
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
