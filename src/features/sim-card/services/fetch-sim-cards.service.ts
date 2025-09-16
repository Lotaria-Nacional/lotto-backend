import { SimCardStatus } from '@lotaria-nacional/lotto';
import { PaginationParams } from '../../../@types/pagination-params';
import prisma from '../../../lib/prisma';
import { Prisma } from '@prisma/client';

export async function fetchSimCardsService(params: PaginationParams) {
  const offset = (params.page - 1) * params.limit;

  const where = buildSimCardWhereInput(params);

  const simCards = await prisma.simCard.findMany({
    where,
    skip: offset,
    take: params.limit,
    orderBy: {
      created_at: 'desc',
    },
    include: {
      terminal: true,
    },
  });

  const nextPage = simCards.length === params.limit ? params.page + 1 : null;

  return { data: simCards, nextPage };
}

const createSimCardSearchFilters = (query: string): Prisma.SimCardWhereInput[] => {
  const filters: Prisma.SimCardWhereInput[] = [];

  if (!query) return filters;

  filters.push({ number: { contains: query } });

  return filters;
};

const getStatus = (status: SimCardStatus): Prisma.SimCardWhereInput[] => {
  if (!status) return [];

  switch (status) {
    case 'stock':
      return [{ status: 'stock' }];
    case 'active':
      return [{ status: 'active' }];
    default:
      return [];
  }
};

const buildSimCardWhereInput = (params: PaginationParams): Prisma.SimCardWhereInput => {
  const filters = createSimCardSearchFilters(params.query);
  let where: Prisma.SimCardWhereInput = {
    AND: [
      ...(filters.length ? [{ OR: filters }] : []),
      ...(params.status ? getStatus(params.status as SimCardStatus) : []),
    ],
  };

  return where;
};
