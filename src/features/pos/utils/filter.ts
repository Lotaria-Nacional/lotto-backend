import { Prisma, PosStatus } from '@prisma/client';
import { PaginationParams } from '../../../@types/pagination-params';
import { createSlug } from '../../../utils/slug';

export const createPosSearchFilters = (query: string | undefined) => {
  const filters: Prisma.PosWhereInput[] = [];
  const numericQuery = Number(query);

  if (!query?.trim()) return filters;

  filters.push({ admin: { name: { contains: query, mode: 'insensitive' } } });
  filters.push({ city: { name: { contains: query, mode: 'insensitive' } } });
  filters.push({ province: { name: { contains: query, mode: 'insensitive' } } });
  filters.push({ licence_reference: { contains: query, mode: 'insensitive' } });
  filters.push({ type: { name: { contains: query, mode: 'insensitive' } } });
  filters.push({ subtype: { name: { contains: query, mode: 'insensitive' } } });
  filters.push({ area: { name: { contains: query, mode: 'insensitive' } } });

  if (!isNaN(numericQuery)) {
    filters.push({ latitude: numericQuery });
    filters.push({ longitude: numericQuery });
    filters.push({ zone_number: numericQuery });
    filters.push({ agent: { id_reference: numericQuery } });
  }

  return filters;
};

export const getStatus = (status?: PosStatus): Prisma.PosWhereInput[] => {
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

export const buildPosWhereInput = (params: PaginationParams): Prisma.PosWhereInput => {
  const filters = createPosSearchFilters(params.query);

  let where: Prisma.PosWhereInput = {
    AND: [
      ...(filters.length ? [{ OR: filters }] : []),
      ...(params.status ? getStatus(params.status as PosStatus) : []),

      ...(params.area_name ? [{ area_name: params.area_name }] : []),
      ...(params.admin_name ? [{ admin: { slug: createSlug(params.admin_name) } }] : []),
      ...(params.zone_number ? [{ zone_number: params.zone_number }] : []),

      ...(params.subtype_name
        ? [{ subtype: { slug: createSlug(params.subtype_name) } }]
        : params.type_name
        ? [{ type: { slug: createSlug(params.type_name) } }]
        : []),

      ...(params.province_name ? [{ province: { slug: createSlug(params.province_name) } }] : []),
      ...(params.city_name ? [{ city: { slug: createSlug(params.city_name) } }] : []),
    ],
  };

  return where;
};
