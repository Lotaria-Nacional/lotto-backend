import prisma from '../../../lib/prisma';
import { Prisma, AgentStatus } from '@prisma/client';
import { RedisKeys } from '../../../utils/redis/keys';
import { PaginationParams } from '../../../@types/pagination-params';
import { Agent } from '@lotaria-nacional/lotto';

export type FetchAgentsResponse = {
  data: Agent[];
  nextPage?: number | null;
};

export async function fetchAgents(params: PaginationParams & { status?: AgentStatus }) {
  const cacheKey = RedisKeys.agents.listWithFilters(params);

  let search = buildFilters(params.query);

  let start: Date | undefined;
  let end: Date | undefined;
  let isValidDate: boolean = false;

  if (params.training_date) {
    const parsedDate = new Date(params.training_date);
    isValidDate = !isNaN(parsedDate.getTime());

    if (isValidDate) {
      start = new Date(parsedDate);
      end = new Date(parsedDate);
      end.setDate(end.getDate() + 1);
    }
  }

  const offset = (params.page - 1) * params.limit;

  let where: Prisma.AgentWhereInput = {};

  if (params.status === 'active') {
    where = {
      status: AgentStatus.active,
    };
  } else if (params.status === 'scheduled') {
    where = {
      status: { notIn: [AgentStatus.active] },
    };
  }

  const agents = await prisma.agent.findMany({
    where,
    take: params.limit,
    skip: offset,
    orderBy: { created_at: 'asc' },
    include: {
      terminal: true,
      pos: true,
    },
  });

  const nextPage = agents.length === params.limit ? params.page + 1 : null;

  return { data: agents, nextPage };
}

function buildFilters(query: string | undefined) {
  let filters: Prisma.AgentWhereInput[] = [];

  if (!query?.trim()) return filters;

  if (Object.values(AgentStatus).includes(query.toLowerCase() as AgentStatus)) {
    filters.push({
      status: { equals: query.toLowerCase() as AgentStatus },
    });
  }

  filters.push(
    { bi_number: { contains: query, mode: 'insensitive' } },
    { last_name: { contains: query, mode: 'insensitive' } },
    { first_name: { contains: query, mode: 'insensitive' } },
    { phone_number: { contains: query } },
    { afrimoney_number: { contains: query } }
  );

  if (!isNaN(Number(query))) {
    {
      id_reference: Number(query);
    }
    filters.push();
  }

  return filters;
}
