import prisma from '../../../lib/prisma';
import { PosStatus, Prisma } from '@prisma/client';
import { PaginationParams } from '../../../@types/pagination-params';

export async function fetchPoService(params: PaginationParams & { status?: PosStatus }) {
  const offset = (params.page - 1) * params.limit;

  const where = buildPosWhereInput(params);

  const pos = await prisma.pos.findMany({
    where,
    skip: offset,
    take: params.limit,
    orderBy: { created_at: 'asc' },
    select: {
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

const createPosSearchFilters = (query: string | undefined) => {
  const filters: Prisma.PosWhereInput[] = [];
  const numericQuery = Number(query);

  if (!query?.trim()) return filters;

  filters.push({
    licence_reference: { equals: query },
  });

  if (!isNaN(numericQuery)) {
    filters.push({
      agent: { id_reference: numericQuery },
      latitude: numericQuery,
      longitude: numericQuery,
      zone_number: numericQuery,
    });
  }

  return filters;
};

const getStatus = (status?: PosStatus): Prisma.PosWhereInput[] => {
  if (!status) return [];

  switch (status) {
    case 'active':
      return [{ status: 'active' }];
    case 'pending':
      return [{ status: { in: ['pending', 'approved', 'denied'] } }];
    default:
      return [];
  }
};

const buildPosWhereInput = (params: PaginationParams): Prisma.PosWhereInput => {
  const filters = createPosSearchFilters(params.query);
  let where: Prisma.PosWhereInput = {
    AND: [
      ...(filters.length ? [{ OR: filters }] : []),
      ...(params.status ? getStatus(params.status as PosStatus) : []),
      ...(params.area_name ? [{ area_name: params.area_name }] : []),
      ...(params.zone_number ? [{ zone_number: params.zone_number }] : []),
      ...(params.type_name ? [{ type_name: params.type_name }] : []),
      ...(params.subtype_name ? [{ subtype_name: params.subtype_name }] : []),
      ...(params.admin_name ? [{ admin_name: params.admin_name }] : []),
      ...(params.province_name ? [{ province_name: params.province_name }] : []),
      ...(params.city_name ? [{ city_name: params.city_name }] : []),
    ],
  };

  return where;
};
