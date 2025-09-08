import { PaginationParams } from '../../../@types/pagination-params';
import prisma from '../../../lib/prisma';
import { Prisma, SimCardStatus } from '@prisma/client';

export async function fetchSimCardsService(params: PaginationParams & { status?: SimCardStatus }) {
  const offset = (params.page - 1) * params.limit;

  let where: Prisma.SimCardWhereInput = {};

  if (params.status === 'stock') {
    where.status = {
      notIn: [SimCardStatus.active],
    };
  } else if (params.status === 'active') {
    where.status = SimCardStatus.active;
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

  return simCards;
}
