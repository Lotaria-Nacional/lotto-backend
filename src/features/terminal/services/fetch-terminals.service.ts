import prisma from '../../../lib/prisma';
import { RedisKeys } from '../../../utils/redis/keys';
import { Prisma } from '@prisma/client';
import { setCache } from '../../../utils/redis/set-cache';
import { PaginationParams } from '../../../@types/pagination-params';
import { TerminalStatus } from '@lotaria-nacional/lotto';

export async function fetchTerminalsService(params: PaginationParams) {
  const cacheKey = RedisKeys.terminals.listWithFilters(params);

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

  let where: Prisma.TerminalWhereInput = {};

  if ((params.status as TerminalStatus) === 'stock') {
    where.status = { in: ['stock'] };
  } else if ((params.status as TerminalStatus) === 'on_field') {
    where.status = { in: ['on_field', 'ready'] };
  } else if ((params.status as TerminalStatus) === 'broken') {
    where.status = { in: ['broken'] };
  } else if ((params.status as TerminalStatus | 'stock-ready') === 'stock-ready') {
    where.status = { in: ['stock', 'ready'] };
  }

  const offset = (params.page - 1) * params.limit;

  const terminals = await prisma.terminal.findMany({
    where,
    take: params.limit,
    skip: offset,
    orderBy: { created_at: 'desc' },
    include: {
      sim_card: {
        select: {
          number: true,
        },
      },
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
