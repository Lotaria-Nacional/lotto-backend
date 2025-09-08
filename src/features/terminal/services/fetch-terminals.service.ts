import prisma from '../../../lib/prisma';
import { RedisKeys } from '../../../utils/redis/keys';
import { Prisma, TerminalStatus } from '@prisma/client';
import { PaginationParams } from '../../../@types/pagination-params';

export async function fetchTerminalsService(params: PaginationParams) {
  const cacheKey = RedisKeys.terminals.listWithFilters(params);

  const filters = buildFilters(params.query);

  let start: Date | undefined;
  let end: Date | undefined;
  let isValidDate: boolean = false;

  if (params.delivery_date) {
    const parsedDate = new Date(params.delivery_date);
    isValidDate = !isNaN(parsedDate.getTime());

    if (isValidDate) {
      start = new Date(parsedDate);
      end = new Date(parsedDate);
      end.setDate(end.getDate() + 1);
    }
  }

  // const wheres: Prisma.TerminalWhereInput = {
  //   ...(filters.length > 0 && { OR: filters }),
  //   ...(params.area_id && { area_id: params.area_id }),
  //   ...(params.zone_id && { zone_id: params.zone_id }),
  //   ...(params.city_id && { city_id: params.city_id }),
  //   ...(params.agent_id && { agent_id: params.agent_id }),
  //   ...(params.province_id && { province_id: params.province_id }),
  //   status: TerminalStatus.ready,
  //   ...(isValidDate && {
  //     delivery_date: {
  //       gte: start,
  //       lt: end,
  //     },
  //   }),
  // };

  const offset = (params.page - 1) * params.limit;

  const terminals = await prisma.terminal.findMany({
    where: {
      status: TerminalStatus.broken,
    },
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

  return { data: terminals, nextPage };
}

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
