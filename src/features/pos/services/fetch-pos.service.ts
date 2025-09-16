import prisma from '../../../lib/prisma';
import { PosStatus, Prisma } from '@prisma/client';
import { PaginationParams } from '../../../@types/pagination-params';

export async function fetchPoService(params: PaginationParams) {
  const offset = (params.page - 1) * params.limit;

  const where = buildPosWhereInput(params);

  const pos = await prisma.pos.findMany({
    where,
    skip: offset,
    take: params.limit,
    orderBy: { created_at: 'desc' },
    select: {
      licence: true,
      agent: {
        select: {
          id: true,
          id_reference: true,
          first_name: true,
          last_name: true,
          genre: true,
          bi_number: true,
          terminal: { select: { id: true, serial: true } },
        },
      },
      status: true,
      id: true,
      latitude: true,
      longitude: true,
      admin: true,
      area: true,
      zone: true,
      type: true,
      subtype: true,
      province: true,
      city: true,
    },
  });

  console.log(pos);

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
      return [{ status: { in: ['active', 'approved'] } }];
    case 'pending':
      return [{ status: { in: ['pending', 'denied'] } }];
    default:
      return [];
  }
};

const buildPosWhereInput = (params: PaginationParams): Prisma.PosWhereInput => {
  const filters = createPosSearchFilters(params.query);

  let where: Prisma.PosWhereInput = {
    AND: [
      // Filtros textuais ou numéricos
      ...(filters.length ? [{ OR: filters }] : []),

      // Filtro de status do terminal
      ...(params.status ? getStatus(params.status as PosStatus) : []),

      // Filtros relacionais
      ...(params.admin_name ? [{ agent: { pos: { admin_name: params.admin_name } } }] : []),
      ...(params.area_name ? [{ agent: { pos: { area_name: params.area_name } } }] : []),
      ...(params.zone_number ? [{ agent: { pos: { zone_number: params.zone_number } } }] : []),
      ...(params.type_name ? [{ agent: { pos: { type_name: params.type_name } } }] : []),
      ...(params.subtype_name ? [{ agent: { pos: { subtype_name: params.subtype_name } } }] : []),
      ...(params.province_name ? [{ agent: { pos: { province_name: params.province_name } } }] : []),
      ...(params.city_name ? [{ agent: { pos: { city_name: params.city_name } } }] : []),
    ],
  };

  return where;
};
