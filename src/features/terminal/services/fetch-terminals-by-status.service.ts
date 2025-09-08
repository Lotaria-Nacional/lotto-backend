import prisma from '../../../lib/prisma';
import { RedisKeys } from '../../../utils/redis/keys';
import { Prisma, TerminalStatus } from '@prisma/client';
import { getCache } from '../../../utils/redis/get-cache';
import { setCache } from '../../../utils/redis/set-cache';
import { PaginationParams } from '../../../@types/pagination-params';

async function fetchTerminalsByStatus(params: PaginationParams, status?: TerminalStatus | 'others') {
  const cacheKey = RedisKeys.terminals.listWithFilters(params);

  // cache opcional
  // const cached = await getCache(cacheKey);
  // if (cached) return cached;

  const filters = buildFilters(params.query);

  let start: Date | undefined;
  let end: Date | undefined;
  let isValidDate = false;

  if (params.delivery_date) {
    const parsedDate = new Date(params.delivery_date);
    isValidDate = !isNaN(parsedDate.getTime());

    if (isValidDate) {
      start = new Date(parsedDate);
      end = new Date(parsedDate);
      end.setDate(end.getDate() + 1);
    }
  }

  // monta where dinamicamente
  const where: Prisma.TerminalWhereInput = {
    ...(filters.length > 0 && { OR: filters }),
    ...(params.area_id && { area_id: params.area_id }),
    ...(params.zone_id && { zone_id: params.zone_id }),
    ...(params.city_id && { city_id: params.city_id }),
    ...(params.agent_id && { agent_id: params.agent_id }),
    ...(params.province_id && { province_id: params.province_id }),
    ...(isValidDate && {
      delivery_date: { gte: start, lt: end },
    }),

    ...(status === 'others'
      ? { status: { notIn: [TerminalStatus.ready, TerminalStatus.broken, TerminalStatus.maintenance] } }
      : status
      ? { status }
      : {}),
  };

  const offset = (params.page - 1) * params.limit;

  const terminals = await prisma.terminal.findMany({
    where,
    take: params.limit,
    skip: offset,
    orderBy: { created_at: 'desc' },
    include: {
      agent: {
        select: {
          id: true,
          id_reference: true,
          first_name: true,
          last_name: true,
        },
      },
    },
  });

  const nextPage = terminals.length === params.limit ? params.page + 1 : null;

  if (terminals.length > 0) {
    await setCache(cacheKey, terminals);
  }

  return { data: terminals, nextPage };
}

// Wrappers para cada página
export const fetchReadyTerminals = (params: PaginationParams) => fetchTerminalsByStatus(params, TerminalStatus.ready);

export const fetchBrokenTerminals = (params: PaginationParams) => fetchTerminalsByStatus(params, TerminalStatus.broken);

export const fetchStockTerminals = (params: PaginationParams) => fetchTerminalsByStatus(params, 'others');

// Função auxiliar de filtros
function buildFilters(query: string): Prisma.TerminalWhereInput[] {
  const filters: Prisma.TerminalWhereInput[] = [];
  if (!query) return filters;

  const numericQuery = Number(query);
  const isNumeric = !isNaN(numericQuery);

  filters.push({ serial: { contains: query, mode: 'insensitive' } });
  filters.push({ device_id: { contains: query, mode: 'insensitive' } });

  if (isNumeric) {
    filters.push({ agent: { id_reference: numericQuery } });
  }

  return filters;
}
