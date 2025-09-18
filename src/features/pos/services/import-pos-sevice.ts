import fs from 'fs';
import csvParser from 'csv-parser';
import { CreatePosDTO, createPosSchema, PosStatus } from '@lotaria-nacional/lotto';
import prisma from '../../../lib/prisma';

interface ImportPosResponse {
  imported: number;
  errors: { row: any; error: any }[];
}

export async function importPosFromCsvService(filePath: string): Promise<ImportPosResponse> {
  const posBatch: any[] = [];
  const errors: any[] = [];
  const BATCH_SIZE = 500;

  const stream = fs.createReadStream(filePath).pipe(csvParser());

  for await (const row of stream) {
    try {
      const status: PosStatus = row.agent_id_reference ? 'active' : row.licence_reference ? 'approved' : 'pending';

      const input: CreatePosDTO & { status: PosStatus } = {
        status,
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
        agent_id_reference: row.agent_id_reference || undefined,
      };

      const parsed = createPosSchema.parse(input);
      posBatch.push(parsed);

      if (posBatch.length >= BATCH_SIZE) {
        await prisma.pos.createMany({
          data: posBatch,
          skipDuplicates: true,
        });

        posBatch.length = 0;
      }
    } catch (err: any) {
      errors.push({ row, error: err.errors || err.message });
      console.error(err);
    }
  }

  if (posBatch.length > 0) {
    await prisma.pos.createMany({
      data: posBatch,
      skipDuplicates: true,
    });
  }

  return { errors, imported: posBatch.length + errors.length };
}
