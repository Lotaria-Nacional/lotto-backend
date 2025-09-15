import prisma from '../../../lib/prisma';
import { Prisma, AgentStatus } from '@prisma/client';
import { PaginationParams } from '../../../@types/pagination-params';
import { Agent } from '@lotaria-nacional/lotto';

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

const createAgentSearchFilter = (query?: string): Prisma.AgentWhereInput[] => {
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
};

const getAgentsByStatus = (status: AgentStatus): Prisma.AgentWhereInput[] => {
  if (!status) return [];

  if (status === 'active') return [{ status: AgentStatus.active }];

  return [{ status: { notIn: [AgentStatus.active] } }];
};

const buildAgentWhereInput = (params: PaginationParams): Prisma.AgentWhereInput => {
  let query = createAgentSearchFilter(params.query);

  let where: Prisma.AgentWhereInput = {
    AND: [
      // Filtros textuais ou numéricos
      ...(query.length ? [{ OR: query }] : []),

      // Filtro de status do agente
      ...(params.status ? getAgentsByStatus(params.status as AgentStatus) : []),

      // Filtro relacional
      ...(params.area_name ? [{ pos: { area: { name: params.area_name } } }] : []),
      ...(params.zone_number ? [{ pos: { zone: { number: params.zone_number } } }] : []),
      ...(params.type_name ? [{ pos: { area: { name: params.type_name } } }] : []),
      ...(params.subtype_name ? [{ pos: { area: { name: params.subtype_name } } }] : []),
      ...(params.province_name ? [{ pos: { area: { name: params.province_name } } }] : []),
      ...(params.city_name ? [{ pos: { area: { name: params.city_name } } }] : []),
      ...(params.admin_name ? [{ pos: { area: { name: params.admin_name } } }] : []),
    ],
  };

  return where;
};
