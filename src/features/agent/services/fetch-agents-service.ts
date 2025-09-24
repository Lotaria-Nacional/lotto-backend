import prisma from '../../../lib/prisma';
import { Agent } from '@lotaria-nacional/lotto';
import { buildAgentWhereInput } from '../utils/filters';
import { PaginationParams } from '../../../@types/pagination-params';

export type FetchAgentsResponse = {
  data: Agent[];
  nextPage?: number | null;
};

export async function fetchAgentsService(params: PaginationParams) {
  const offset = (params.page - 1) * params.limit;

  const where = buildAgentWhereInput(params);

  const agents = await prisma.agent.findMany({
    where,
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
      agent_type: true,
      id_reference: true,
      afrimoney_number: true,
      terminal: {
        select: {
          id: true,
          serial: true,
          device_id: true,
          sim_card: {
            select: {
              number: true,
            },
          },
        },
      },
      pos: {
        select: {
          area: { select: { id: true, name: true } },
          zone: { select: { id: true, number: true } },
          type: { select: { id: true, name: true } },
          subtype: { select: { id: true, name: true } },
          province: { select: { id: true, name: true } },
          city: { select: { id: true, name: true } },
        },
      },
    },
  });

  const nextPage = agents.length === params.limit ? params.page + 1 : null;

  return { data: agents, nextPage };
}
