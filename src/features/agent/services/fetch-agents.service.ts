import prisma from '../../../lib/prisma';
import { Prisma, AgentStatus } from '@prisma/client';
import { RedisKeys } from '../../../utils/redis/keys';
import { PaginationParams } from '../../../@types/pagination-params';
import { Agent } from '@lotaria-nacional/lotto';

export type FetchAgentsResponse = {
  data: Agent[];
  nextPage?: number | null;
};

export async function fetchAgentsService(params: PaginationParams) {
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

  let queryFilters = buildFilters(params.query);

  const where: Prisma.AgentWhereInput = {
    AND: [
      // Filtros textuais ou numéricos
      ...(queryFilters.length ? [{ OR: queryFilters }] : []),

      // Filtro de status do agente
      ...(params.status ? getStatus(params.status as AgentStatus) : []),

      // Filtro relacional
      ...(params.area_id ? [{ pos: { area: { id: params.area_id } } }] : []),
      ...(params.zone_id ? [{ pos: { area: { id: params.zone_id } } }] : []),
      ...(params.type_id ? [{ pos: { area: { id: params.type_id } } }] : []),
      ...(params.subtype_id ? [{ pos: { area: { id: params.subtype_id } } }] : []),
    ],
  };

  const agents = await prisma.agent.findMany({
    where,
    take: params.limit,
    skip: offset,
    orderBy: { created_at: 'asc' },
    include: {
      terminal: {
        include: {
          sim_card: {
            select: {
              number: true,
            },
          },
        },
      },
      pos: {
        include: {
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

function buildFilters(query?: string): Prisma.AgentWhereInput[] {
  if (!query?.trim()) return [];

  const filters: Prisma.AgentWhereInput[] = [];

  // filtros textuais
  filters.push(
    { bi_number: { contains: query, mode: 'insensitive' } },
    { last_name: { contains: query, mode: 'insensitive' } },
    { first_name: { contains: query, mode: 'insensitive' } },
    { phone_number: { contains: query, mode: 'insensitive' } },
    { afrimoney_number: { contains: query, mode: 'insensitive' } }
  );

  // se for número, adiciona filtros numéricos
  const numericQuery = Number(query);
  if (!isNaN(Number(query))) {
    filters.push({ id_reference: numericQuery });
  }

  return filters;
}

function getStatus(status: AgentStatus) {
  if (!status) return [];

  if (status === 'active') return [{ status: AgentStatus.active }];

  return [{ status: { notIn: [AgentStatus.active] } }];
}
