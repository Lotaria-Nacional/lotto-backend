import prisma from '../../../lib/prisma';
import { PosStatus, Prisma } from '@prisma/client';
import { PaginationParams } from '../../../@types/pagination-params';

export async function fetchPoService(params: PaginationParams & { status?: PosStatus }) {
  const offset = (params.page - 1) * params.limit;

  let where: Prisma.PosWhereInput = {};

  if (params.status === 'pending') {
    where.status = {
      notIn: ['active', 'approved'],
    };
  } else if (params.status === 'active') {
    where.status = {
      in: ['active', 'approved'],
    };
  }

  const pos = await prisma.pos.findMany({
    where,
    skip: offset,
    take: params.limit,
    orderBy: { created_at: 'asc' },
    include: {
      licence: true,
      agent: {
        select: {
          id: true,
          id_reference: true,
          first_name: true,
          last_name: true,
          terminal: { select: { id: true, serial: true } },
        },
      },
      admin: true,
      area: true,
      zone: true,
      type: true,
      subtype: true,
      province: true,
      city: true,
    },
  });

  const nextPage = pos.length === params.limit ? params.page + 1 : null;

  return { data: pos, nextPage };
}

function buildFilters(query: string | undefined) {
  const filters: Prisma.PosWhereInput[] = [];
  const numericQuery = Number(query);

  if (!query?.trim()) return filters;

  filters.push({
    coordinates: { contains: query },
  });

  if (!isNaN(numericQuery)) {
    filters.push({
      agent: {
        id_reference: numericQuery,
      },
    });
  }

  return filters;
}
