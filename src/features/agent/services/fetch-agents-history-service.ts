import prisma from '../../../lib/prisma';
import { Agent } from '@lotaria-nacional/lotto';
import { PaginationParams } from '../../../@types/pagination-params';

export type FetchAgentsResponse = {
  data: Agent[];
  nextPage?: number | null;
};

export async function fetchAgentsHistoryService(params: PaginationParams) {
  const offset = (params.page - 1) * params.limit;

  const agents = await prisma.agent.findMany({
    where: {
      status: { in: ['discontinued', 'denied'] },
    },
    take: params.limit,
    skip: offset,
    orderBy: { created_at: 'desc' },
    select: {
      status: true,
      id: true,
      first_name: true,
      last_name: true,
      bi_number: true,
      approved_at: true,
      genre: true,
      phone_number: true,
      training_date: true,
      id_reference: true,
      afrimoney_number: true,
    },
  });

  const nextPage = agents.length === params.limit ? params.page + 1 : null;

  return { data: agents, nextPage };
}
