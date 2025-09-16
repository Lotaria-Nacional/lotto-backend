import prisma from '../../../lib/prisma';
import { Prisma } from '@prisma/client';
import { TerminalStatus } from '@lotaria-nacional/lotto';
import { PaginationParams } from '../../../@types/pagination-params';

export async function fetchTerminalsService(params: PaginationParams) {
  const where = buildTermninalWhereInput(params);

  const offset = (params.page - 1) * params.limit;

  const terminals = await prisma.terminal.findMany({
    where,
    take: params.limit,
    skip: offset,
    orderBy: { created_at: 'desc' },
    include: {
      sim_card: {
        select: {
          id: true,
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

// Função auxiliar de filtros
function createTerminalSearchFilters(query: string): Prisma.TerminalWhereInput[] {
  const filters: Prisma.TerminalWhereInput[] = [];

  if (!query) return filters;

  const numericQuery = Number(query);
  const isNumeric = !isNaN(numericQuery);

  filters.push({ sim_card: { number: { contains: query } } });
  filters.push({ serial: { contains: query, mode: 'insensitive' } });
  filters.push({ device_id: { contains: query, mode: 'insensitive' } });

  if (isNumeric) {
    filters.push({ agent: { id_reference: numericQuery } });
  }

  return filters;
}

function getStatus(status: TerminalStatus | 'stock-ready'): Prisma.TerminalWhereInput[] {
  if (!status) return [];

  switch (status) {
    case 'stock':
      return [{ status: 'stock' }];
    case 'on_field':
      return [{ status: { in: ['on_field', 'ready'] } }];
    case 'broken':
      return [{ status: 'broken' }];
    case 'stock-ready':
      return [{ status: { in: ['stock', 'ready'] } }];
    default:
      return [];
  }
}

function buildTermninalWhereInput(params: PaginationParams): Prisma.TerminalWhereInput {
  const filters = createTerminalSearchFilters(params.query);

  let where: Prisma.TerminalWhereInput = {
    AND: [
      // Filtros textuais ou numéricos
      ...(filters.length ? [{ OR: filters }] : []),

      // Filtro de status do terminal
      ...(params.status ? getStatus(params.status as TerminalStatus | 'stock-ready') : []),

      // Filtros relacionais
      ...(params.admin_name ? [{ agent: { pos: { admin: { name: params.admin_name } } } }] : []),
      ...(params.area_name ? [{ agent: { pos: { area: { name: params.area_name } } } }] : []),
      ...(params.zone_number ? [{ agent: { pos: { zone: { number: params.zone_number } } } }] : []),
      ...(params.type_name ? [{ agent: { pos: { type: { name: params.type_name } } } }] : []),
      ...(params.subtype_name ? [{ agent: { pos: { subtype: { name: params.subtype_name } } } }] : []),
      ...(params.province_name ? [{ agent: { pos: { province: { name: params.province_name } } } }] : []),
      ...(params.city_name ? [{ agent: { pos: { city: { name: params.city_name } } } }] : []),
    ],
  };

  return where;
}
