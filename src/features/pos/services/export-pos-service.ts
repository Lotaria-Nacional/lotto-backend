import { Pos } from '@prisma/client';
import prisma from '../../../lib/prisma';
import { stringify } from 'csv-stringify';
import type { Response } from 'express';

export async function exportPosService(res: Response, { buffered = false }: { buffered?: boolean } = {}) {
  // Busca POS em batches (para streaming)
  if (!buffered) {
    const cursorSize = 1000;
    let cursor: string | null = null;

    // Headers do CSV
    res.write(
      'id,latitude,longitude,status,created_at,admin_name,province_name,city_name,area_name,zone_number,type_name,subtype_name,agent_id_reference,licence_reference\n'
    );

    while (true) {
      const batch: Pos[] = await prisma.pos.findMany({
        take: cursorSize,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
      });

      if (batch.length === 0) break;

      for (const pos of batch) {
        const line =
          [
            pos.id,
            pos.latitude,
            pos.longitude,
            pos.status,
            pos.created_at.toISOString(),
            pos.admin_name,
            pos.province_name,
            pos.city_name,
            pos.area_name ?? '',
            pos.zone_number ?? '',
            pos.type_name ?? '',
            pos.subtype_name ?? '',
            pos.agent_id_reference ?? '',
            pos.licence_reference ?? '',
          ].join(',') + '\n';

        res.write(line);
      }

      cursor = batch[batch.length - 1].id;
    }

    res.end();
    return;
  }

  // ---------------------------
  // 📦 Modo "buffered" → gera tudo de uma vez
  // ---------------------------
  const allPos = await prisma.pos.findMany();
  const stringifier = stringify({
    header: true,
    columns: [
      'id',
      'latitude',
      'longitude',
      'status',
      'created_at',
      'admin_name',
      'province_name',
      'city_name',
      'area_name',
      'zone_number',
      'type_name',
      'subtype_name',
      'agent_id_reference',
      'licence_reference',
    ],
  });

  let csv = '';
  for (const pos of allPos) {
    stringifier.write({
      id: pos.id,
      latitude: pos.latitude,
      longitude: pos.longitude,
      status: pos.status,
      created_at: pos.created_at.toISOString(),
      admin_name: pos.admin_name,
      province_name: pos.province_name,
      city_name: pos.city_name,
      area_name: pos.area_name ?? '',
      zone_number: pos.zone_number ?? '',
      type_name: pos.type_name ?? '',
      subtype_name: pos.subtype_name ?? '',
      agent_id_reference: pos.agent_id_reference ?? '',
      licence_reference: pos.licence_reference ?? '',
    });
  }

  stringifier.end();

  stringifier.on('readable', () => {
    let row;
    while ((row = stringifier.read()) !== null) {
      csv += row;
    }
  });

  await new Promise<void>((resolve) => stringifier.on('end', resolve));

  res.setHeader('Content-Length', Buffer.byteLength(csv));
  res.end(csv);
}
