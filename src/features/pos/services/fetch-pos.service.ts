import prisma from '../../../lib/prisma';
import { PosStatus, Prisma } from '@prisma/client';
import { PaginationParams } from '../../../@types/pagination-params';

export async function fetchPoService(params: PaginationParams & { status?: PosStatus }) {
  const offset = (params.page - 1) * params.limit;

  const queryFilters = buildFilters(params.query);

  const where: Prisma.PosWhereInput = {
    AND: [
      ...(queryFilters.length ? [{ OR: queryFilters }] : []),

      ...(params.status ? getStatus(params.status as PosStatus) : []),

      ...(params.area_id ? [{ area_id: params.area_id }] : []),
      ...(params.zone_id ? [{ zone_id: params.zone_id }] : []),
      ...(params.type_id ? [{ type_id: params.type_id }] : []),
      ...(params.subtype_id ? [{ subtype_id: params.subtype_id }] : []),
      ...(params.admin_id ? [{ admin_id: params.admin_id }] : []),
      ...(params.province_id ? [{ province_id: params.province_id }] : []),
      ...(params.city_id ? [{ city_id: params.city_id }] : []),
    ],
  };

  const pos = await prisma.pos.findMany({
    where,
    skip: offset,
    take: params.limit,
    orderBy: { created_at: 'asc' },
    include: {
      licence: true,
      agent: {
        select: {
          id: true,
          id_reference: true,
          first_name: true,
          last_name: true,
          terminal: { select: { id: true, serial: true } },
        },
      },
      admin: true,
      area: true,
      zone: true,
      type: true,
      subtype: true,
      province: true,
      city: true,
    },
  });

  const nextPage = pos.length === params.limit ? params.page + 1 : null;

  return { data: pos, nextPage };
}

function buildFilters(query: string | undefined) {
  const filters: Prisma.PosWhereInput[] = [];
  const numericQuery = Number(query);

  if (!query?.trim()) return filters;

  filters.push({
    licence: { id: query },
  });

  if (!isNaN(numericQuery)) {
    filters.push({
      agent: { id_reference: numericQuery },
      area_id: numericQuery,
      latitude: numericQuery,
      longitude: numericQuery,
      zone_id: numericQuery,
      type_id: numericQuery,
      subtype_id: numericQuery,
      admin_id: numericQuery,
      province_id: numericQuery,
      city_id: numericQuery,
    });
  }

  return filters;
}

function getStatus(status?: PosStatus): Prisma.PosWhereInput[] {
  if (!status) return [];

  if (status === 'pending') {
    return [{ status: { in: ['pending', 'approved', 'denied'] } }];
  }
  if (status === 'active') {
    return [{ status: { in: ['active'] } }];
  }

  return [];
}
