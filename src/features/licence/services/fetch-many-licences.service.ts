import prisma from '../../../lib/prisma';
import { Prisma, LicenceStatus } from '@prisma/client';
import { PaginationParams } from '../../../@types/pagination-params';
import { getCache, RedisKeys, setCache } from '../../../utils/redis';

export async function fetchManyLicencesService(params: PaginationParams) {
  // const cacheKey = RedisKeys.licences.listWithFilters(params);

  // const cached = await getCache(cacheKey);
  // if (cached) return cached;

  const searchFilters = makeLicenceFilters(params.query);

  const where: Prisma.LicenceWhereInput = {
    ...(searchFilters.length ? { OR: searchFilters } : {}),
    ...(params.admin_id && { admin_id: params.admin_id }),
    ...(params.status && { status: params.status as LicenceStatus }),
  };

  const offset = (params.page - 1) * params.limit;

  const licences = await prisma.licence.findMany({
    where,
    skip: offset,
    take: params.limit,
    orderBy: { emitted_at: 'desc' },
    include: { admin: { select: { id: true, name: true } } },
    omit: { admin_id: true },
  });

  const nextPage = licences.length === params.limit ? params.page + 1 : null;

  return { data: licences, nextPage };
}

// make licence filters function
export const makeLicenceFilters = (query: string): Prisma.LicenceWhereInput[] => {
  const filters: Prisma.LicenceWhereInput[] = [];

  filters.push({ number: { contains: query, mode: 'insensitive' } });
  filters.push({ reference: { contains: query, mode: 'insensitive' } });
  filters.push({ coordinates: { contains: query, mode: 'insensitive' } });
  filters.push({ description: { contains: query, mode: 'insensitive' } });

  if (Object.values(LicenceStatus).includes(query.toLowerCase() as LicenceStatus)) {
    filters.push({
      status: { equals: query.toLowerCase() as LicenceStatus },
    });
  }

  const parsedDate = new Date(query);
  if (!isNaN(parsedDate.getTime())) {
    const start = new Date(parsedDate);
    const end = new Date(parsedDate);
    end.setDate(end.getDate() + 1);

    filters.push({
      emitted_at: {
        gte: start,
        lt: end,
      },
    });
  }

  return filters;
};
