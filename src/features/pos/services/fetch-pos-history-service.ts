import prisma from '../../../lib/prisma';
import { Pos } from '@lotaria-nacional/lotto';
import { PaginationParams } from '../../../@types/pagination-params';

export type FetchPossResponse = {
  data: Pos[];
  nextPage?: number | null;
};

export async function fetchPosHistoryService(params: PaginationParams) {
  const offset = (params.page - 1) * params.limit;

  const Poss = await prisma.pos.findMany({
    where: {
      status: 'discontinued',
    },
    take: params.limit,
    skip: offset,
    orderBy: { created_at: 'desc' },
    select: {
      licence: true,
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
      status: true,
      id: true,
      latitude: true,
      longitude: true,
      admin: true,
      area: true,
      zone: true,
      type: true,
      subtype: true,
      province: true,
      city: true,
    },
  });

  const nextPage = Poss.length === params.limit ? params.page + 1 : null;

  return { data: Poss, nextPage };
}
