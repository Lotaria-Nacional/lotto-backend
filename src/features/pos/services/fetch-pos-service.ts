import prisma from '../../../lib/prisma';
import { buildPosWhereInput } from '../utils/filter';
import { PaginationParams } from '../../../@types/pagination-params';

export async function fetchPoService(params: PaginationParams) {
  const offset = (params.page - 1) * params.limit;

  const where = buildPosWhereInput(params);

  const pos = await prisma.pos.findMany({
    where,
    skip: offset,
    take: params.limit,
    orderBy: { created_at: 'desc' },
    select: {
      licence: {
        include: {
          admin: true,
        },
      },
      agent: {
        select: {
          id: true,
          id_reference: true,
          first_name: true,
          last_name: true,
          genre: true,
          bi_number: true,
          terminal: { select: { id: true, serial: true } },
        },
      },
      pos_id: true,
      id: true,
      status: true,
      latitude: true,
      coordinates: true,
      longitude: true,
      admin: true,
      area: true,
      zone: true,
      type: true,
      subtype: true,
      province: true,
      city: {
        include: {
          administration: true,
          area: true,
          province: true,
          zone: true,
        },
      },
    },
  });

  const nextPage = pos.length === params.limit ? params.page + 1 : null;

  return { data: pos, nextPage };
}
