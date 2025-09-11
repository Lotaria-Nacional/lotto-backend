import { PaginationParams } from '../../../@types/pagination-params';
import prisma from '../../../lib/prisma';
import { Prisma, SimCardStatus } from '@prisma/client';

export async function fetchSimCardsService(params: PaginationParams) {
  const offset = (params.page - 1) * params.limit;

  let where: Prisma.SimCardWhereInput = {};

  if (params.status === 'stock') {
    where.status = {
      in: [SimCardStatus.stock],
    };
  } else if (params.status === 'active') {
    where.status = {
      in: [SimCardStatus.active],
    };
  }

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
