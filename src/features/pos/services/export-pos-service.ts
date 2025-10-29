import { Response } from 'express';
import { Pos } from '@prisma/client';
import prisma from '../../../lib/prisma';
import { buildPosWhereInput } from '../utils/filter';
import { PaginationParams } from '../../../@types/pagination-params';
import { PosStatus } from '@lotaria-nacional/lotto';

const POS_HEADER =
  'ID, ID REVENDEDOR, PROVINCIA, ADMINISTRACAO,CIDADE,AREA,ZONA,ESTADO,TIPOLOGIA, LICENCA, COORDENADAS\n';

export async function exportPosService(res: Response, filters: PaginationParams) {
  const where = buildPosWhereInput(filters);

  res.write(POS_HEADER);

  let cursor: string | null = null;
  const batchSize = 500;

  while (true) {
    const batch: Pos[] = await prisma.pos.findMany({
      where,
      take: batchSize,
      skip: cursor ? 1 : 0,
      ...(cursor ? { cursor: { id: cursor } } : {}),
      orderBy: { id: 'desc' },
    });

    if (batch.length === 0) break;

    for (const pos of batch) {
      console.log(pos);

      const line = [
        pos.id,
        pos.agent_id_reference || '',
        pos.province_name?.toUpperCase() || '',
        pos.admin_name?.toUpperCase() || '',
        pos.city_name?.toUpperCase() || '',
        pos.area_name ? `AREA ${pos.area_name}` : '',
        pos.zone_number ? `ZONA ${pos.zone_number}` : '',
        pos.status ? POS_STATUS[pos.status]?.toUpperCase() : '',
        pos.subtype_name?.toUpperCase() || pos.type_name?.toUpperCase() || '',
        pos.licence_reference?.toUpperCase() || '',
        pos.coordinates || '',
      ]
        .map((v) => `"${v ?? ''}"`)
        .join(',');

      res.write(line + '\n');
    }

    cursor = batch[batch.length - 1].id;
  }

  res.end();
}

const POS_STATUS: Record<PosStatus, string> = {
  active: 'Ativo',
  approved: 'Aprovado',
  denied: 'Negado',
  pending: 'Pendente',
  discontinued: 'Descontinuado',
};
