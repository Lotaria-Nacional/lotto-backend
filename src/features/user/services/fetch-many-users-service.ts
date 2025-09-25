import { Prisma } from '@prisma/client';
import { PaginationParams } from '../../../@types/pagination-params';
import prisma from '../../../lib/prisma';

export async function fetchManyUsersService(params: PaginationParams) {
  const search = buildFilters(params.query);

  let where: Prisma.UserWhereInput | undefined = {
    AND: [{ OR: search }],
  };

  const offset = (params.page - 1) * params.limit;

  const users = await prisma.user.findMany({
    where,
    take: params.limit,
    skip: offset,
    orderBy: { created_at: 'asc' },
  });

  return users;
}

function buildFilters(query: string | undefined) {
  let filters: Prisma.UserWhereInput[] = [];

  if (!query) return filters;

  filters.push({ email: { contains: query, mode: 'insensitive' } });
  filters.push({ last_name: { contains: query, mode: 'insensitive' } });
  filters.push({ first_name: { contains: query, mode: 'insensitive' } });

  return filters;
}
