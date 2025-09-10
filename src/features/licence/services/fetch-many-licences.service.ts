import prisma from '../../../lib/prisma';
import { Prisma, LicenceStatus } from '@prisma/client';
import { PaginationParams } from '../../../@types/pagination-params';

export async function fetchManyLicencesService(params: PaginationParams) {
  const searchFilters = buildFilters(params.query);

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

export const buildFilters = (query: string): Prisma.LicenceWhereInput[] => {
  const filters: Prisma.LicenceWhereInput[] = [];

  filters.push({ number: { contains: query, mode: 'insensitive' } });
  filters.push({ reference: { contains: query, mode: 'insensitive' } });
  filters.push({ coordinates: { contains: query, mode: 'insensitive' } });
  filters.push({ description: { contains: query, mode: 'insensitive' } });

  const numericQuery = Number(query);
  if (!isNaN(numericQuery)) {
    filters.push({ admin_id: numericQuery });
  }

  const parsedDate = new Date(query);
  if (!isNaN(parsedDate.getTime())) {
    const start = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate(), 0, 0, 0, 0);
    const end = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate(), 23, 59, 59, 999);

    filters.push(
      { emitted_at: { gte: start, lte: end } },
      { expires_at: { gte: start, lte: end } } // opcional, se quiser filtrar também pelo vencimento
    );
  }

  return filters;
};
