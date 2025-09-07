import { Prisma } from '@prisma/client';
import prisma from '../../../lib/prisma';
import { PaginationParams } from '../../../@types/pagination-params';
import { setCache, RedisKeys, getCache } from '../../../utils/redis';

export async function fetchManyPos(params: PaginationParams) {
  const cacheKey = RedisKeys.pos.listWithFilters(params);

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const offset = (params.page - 1) * params.limit;

  const pos = await prisma.pos.findMany({
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

  if (pos.length > 0) {
    await setCache(cacheKey, pos);
  }

  return pos;
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

    return filters;
  }
}
