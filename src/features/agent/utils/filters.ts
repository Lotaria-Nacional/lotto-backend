import { Prisma, AgentStatus } from '@prisma/client';
import { PaginationParams } from '../../../@types/pagination-params';

export const createAgentSearchFilter = (query?: string): Prisma.AgentWhereInput[] => {
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

export const getAgentsByStatus = (status: AgentStatus): Prisma.AgentWhereInput[] => {
  if (!status) return [];
  if (status === 'ready') return [{ status: { in: ['ready'] } }];
  if (status === 'denied') return [{ status: { in: ['denied'] } }];
  if (status === 'blocked') return [{ status: { in: ['blocked'] } }];
  if (status === 'approved') return [{ status: { in: ['approved'] } }];
  if (status === 'scheduled') return [{ status: { in: ['scheduled'] } }];
  if (status === 'discontinued') return [{ status: { in: ['discontinued'] } }];
  if (status === 'disapproved') return [{ status: { in: ['disapproved'] } }];
  if (status === 'active') return [{ status: { in: ['approved', 'active', 'ready', 'blocked'] } }];
  return [];
};

export const buildAgentWhereInput = (params: PaginationParams): Prisma.AgentWhereInput => {
  let query = createAgentSearchFilter(params.query);
  let filterByTrainingDate: Prisma.AgentWhereInput[] = [];

  if (params.approved_at) {
    const date = new Date(params.approved_at);

    if (!isNaN(date.getTime())) {
      const startAt = new Date(date);
      startAt.setHours(0, 0, 0, 0);

      const endAt = new Date(date);
      endAt.setHours(23, 59, 59, 999);

      filterByTrainingDate.push({
        approved_at: {
          gte: startAt,
          lte: endAt,
        },
      });
    }
  }

  if (params.training_date) {
    const date = new Date(params.training_date);

    if (!isNaN(date.getTime())) {
      const startAt = new Date(date);
      startAt.setHours(0, 0, 0, 0);

      const endAt = new Date(date);
      endAt.setHours(23, 59, 59, 999);

      filterByTrainingDate.push({
        training_date: {
          gte: startAt,
          lte: endAt,
        },
      });
    }
  }

  let where: Prisma.AgentWhereInput = {
    AND: [
      ...(query.length ? [{ OR: query }] : []),

      ...(params.status ? getAgentsByStatus(params.status as AgentStatus) : []),

      ...(params.area_name ? [{ pos: { area: { name: params.area_name } } }] : []),
      ...(params.zone_number ? [{ pos: { zone: { number: params.zone_number } } }] : []),
      ...(params.type_name ? [{ pos: { type: { name: params.type_name } } }] : []),
      ...(params.subtype_name ? [{ pos: { subtype: { name: params.subtype_name } } }] : []),
      ...(params.province_name ? [{ pos: { province: { name: params.province_name } } }] : []),
      ...(params.city_name ? [{ pos: { city: { name: params.city_name } } }] : []),
      ...(params.admin_name ? [{ pos: { admin: { name: params.admin_name } } }] : []),
      ...filterByTrainingDate,
    ],
  };

  return where;
};
