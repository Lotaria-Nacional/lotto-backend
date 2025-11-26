import { Prisma, TerminalStatus } from '@prisma/client';
import { PaginationParams } from '../../../@types/pagination-params';

export const createTerminalSearchFilters = (query: string): Prisma.TerminalWhereInput[] => {
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
};

export const getStatus = (
  status: TerminalStatus | 'on_field-ready-delivered' | 'stock-ready' | 'on_field-ready'
): Prisma.TerminalWhereInput[] => {
  if (!status) return [];

  switch (status) {
    case 'on_field-ready-delivered':
      return [{ status: { in: ['on_field', 'ready', 'delivered'] } }];
    case 'ready':
      return [{ status: { in: ['ready'] } }];
    case 'stock':
      return [{ status: { in: ['stock'] } }];
    case 'fixed':
      return [{ status: { in: ['fixed'] } }];
    case 'delivered':
      return [{ status: { in: ['delivered'] } }];
    case 'on_field-ready':
      return [{ status: { in: ['on_field', 'ready', 'fixed', 'delivered'] } }];
    case 'on_field':
      return [{ status: { in: ['on_field'] } }];
    case 'broken':
      return [{ status: 'broken' }];
    case 'stock-ready':
      return [{ status: { in: ['stock', 'ready'] } }];
    default:
      return [];
  }
};

export const buildTermninalWhereInput = (params: PaginationParams): Prisma.TerminalWhereInput => {
  const filters = createTerminalSearchFilters(params.query);
  const filterByDate: Prisma.TerminalWhereInput[] = [];

  if (params.arrived_at) {
    const date = new Date(params.arrived_at);

    if (!isNaN(date.getTime())) {
      const startAt = new Date(date);
      startAt.setHours(0, 0, 0, 0);

      const endAt = new Date(date);
      endAt.setHours(23, 59, 59, 999);

      filterByDate.push({
        arrived_at: {
          gte: startAt,
          lte: endAt,
        },
      });
    }
  }

  if (params.leaved_at) {
    const date = new Date(params.leaved_at);

    if (!isNaN(date.getTime())) {
      const startAt = new Date(date);
      startAt.setHours(0, 0, 0, 0);

      const endAt = new Date(date);
      endAt.setHours(23, 59, 59, 999);

      filterByDate.push({
        leaved_at: {
          gte: startAt,
          lte: endAt,
        },
      });
    }
  }

  if (params.activated_at) {
    const date = new Date(params.activated_at);

    if (!isNaN(date.getTime())) {
      const startAt = new Date(date);
      startAt.setHours(0, 0, 0, 0);

      const endAt = new Date(date);
      endAt.setHours(23, 59, 59, 999);

      filterByDate.push({
        activated_at: {
          gte: startAt,
          lte: endAt,
        },
      });
    }
  }

  if (params.delivery_date) {
    const date = new Date(params.delivery_date);

    if (!isNaN(date.getTime())) {
      const startAt = new Date(date);
      startAt.setHours(0, 0, 0, 0);

      const endAt = new Date(date);
      endAt.setHours(23, 59, 59, 999);

      filterByDate.push({
        delivery_at: {
          gte: startAt,
          lte: endAt,
        },
      });
    }
  }

  let where: Prisma.TerminalWhereInput = {
    AND: [
      ...(filters.length ? [{ OR: filters }] : []),

      ...(params.status ? getStatus(params.status as TerminalStatus | 'stock-ready') : []),

      ...(params.admin_name ? [{ agent: { pos: { admin: { name: params.admin_name } } } }] : []),
      ...(params.area_name ? [{ agent: { pos: { area: { name: params.area_name } } } }] : []),
      ...(params.zone_number ? [{ agent: { pos: { zone: { number: params.zone_number } } } }] : []),
      ...(params.type_name ? [{ agent: { pos: { type: { name: params.type_name } } } }] : []),
      ...(params.subtype_name ? [{ agent: { pos: { subtype: { name: params.subtype_name } } } }] : []),
      ...(params.province_name ? [{ agent: { pos: { province: { name: params.province_name } } } }] : []),
      ...(params.city_name ? [{ agent: { pos: { city: { name: params.city_name } } } }] : []),
      ...filterByDate,
    ],
  };

  return where;
};
