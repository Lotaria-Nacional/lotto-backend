import { Response } from 'express';
import { Pos } from '@prisma/client';
import prisma from '../../../lib/prisma';
import { buildPosWhereInput } from '../utils/filter';
import { PaginationParams } from '../../../@types/pagination-params';

export async function exportPosService(res: Response, filters: PaginationParams) {
  const where = buildPosWhereInput(filters);

  // Cabeçalhos CSV
  res.write('LATITUDE,LONGITUDE,ESTADO,DATA CRIACAO,ADMINISTRACAO,PROVINCIA,CIDADE,AREA,ZONA,TIPO,ID AGENTE,LICENCA\n');

  let cursor: string | null = null;
  const batchSize = 500;

  while (true) {
    const batch: Pos[] = await prisma.pos.findMany({
      take: batchSize,
      skip: cursor ? 1 : 0,
      ...(cursor ? { cursor: { id: cursor } } : {}),
      orderBy: { id: 'desc' },
      where,
    });

    if (batch.length === 0) break;

    for (const pos of batch) {
      const line = [
        pos.latitude,
        pos.longitude,
        pos.status,
        pos.created_at?.toISOString().split('T')[0] ?? '',
        pos.admin_name,
        pos.province_name,
        pos.city_name,
        pos.area_name ?? '',
        pos.zone_number ?? '',
        pos.subtype_name ?? pos.type_name,
        pos.agent_id_reference ?? '',
        pos.licence_reference ?? '',
      ]
        .map(v => `"${v ?? ''}"`)
        .join(',');

      res.write(line + '\n');
    }

    cursor = batch[batch.length - 1].id;
  }

  res.end();
}
