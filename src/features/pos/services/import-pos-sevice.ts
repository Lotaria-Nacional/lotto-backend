import fs from 'fs';
import csvParser from 'csv-parser';
import { processPosBatch } from '../utils/process-pos-batch';
import { CreatePosDTO, createPosSchema, AuthPayload } from '@lotaria-nacional/lotto';

interface ImportPosResponse {
  imported: number;
  errors: { row: any; error: any }[];
}

export async function importPosFromCsvService(filePath: string, user: AuthPayload): Promise<ImportPosResponse> {
  const posBatch: any[] = [];
  const errors: any[] = [];
  const BATCH_SIZE = 500;
  let imported = 0;
  try {
  } catch (error) {}
  const stream = fs.createReadStream(filePath).pipe(csvParser());

  for await (const row of stream) {
    try {
      const input: CreatePosDTO & { agent_id_reference?: number; licence_reference?: string } = {
        admin_name: row.admin_name,
        province_name: row.province_name,
        city_name: row.city_name,
        area_name: row.area_name,
        zone_number: row.zone_number,
        latitude: row.latitude,
        longitude: row.longitude,
        type_name: row.type_name,
        subtype_name: row.subtype_name || undefined,
        licence_reference: row.licence_reference || undefined,
        agent_id_reference: row.agent_id_reference ? Number(row.agent_id_reference) : undefined,
      };

      const parsed = createPosSchema.parse(input);
      posBatch.push(parsed);

      if (posBatch.length >= BATCH_SIZE) {
        await processPosBatch({ posList: posBatch, user, errors });
        imported += posBatch.length;
        posBatch.length = 0;
      }
    } catch (err: any) {
      errors.push({ row, error: err.errors || err.message });
      console.error(err);
    }
  }

  if (posBatch.length > 0) {
    await processPosBatch({ posList: posBatch, user, errors });
    imported += posBatch.length;
  }

  return { errors, imported };
}
