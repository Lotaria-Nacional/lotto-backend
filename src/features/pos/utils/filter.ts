import { Prisma, PosStatus } from '@prisma/client';
import { PaginationParams } from '../../../@types/pagination-params';

export const createPosSearchFilters = (query: string | undefined) => {
  const filters: Prisma.PosWhereInput[] = [];
  const numericQuery = Number(query);

  if (!query?.trim()) return filters;

  filters.push({ pos_id: { equals: query, mode: 'insensitive' } });
  filters.push({ admin: { name: { equals: query, mode: 'insensitive' } } });
  filters.push({ city: { name: { equals: query, mode: 'insensitive' } } });
  filters.push({ province: { name: { equals: query, mode: 'insensitive' } } });
  filters.push({ licence_reference: { equals: query, mode: 'insensitive' } });
  filters.push({ type: { name: { equals: query, mode: 'insensitive' } } });
  filters.push({ subtype: { name: { equals: query, mode: 'insensitive' } } });
  filters.push({ area: { name: { equals: query, mode: 'insensitive' } } });

  if (!isNaN(numericQuery)) {
    filters.push({ latitude: numericQuery });
    filters.push({ longitude: numericQuery });
    filters.push({ zone_number: numericQuery });
    filters.push({ agent: { id_reference: numericQuery } });
  }

  return filters;
};

export const getStatus = (status?: PosStatus | 'pending-denied' | 'active-approved'): Prisma.PosWhereInput[] => {
  if (!status) return [];

  switch (status) {
    case 'pending-denied':
      return [{ status: { in: ['pending', 'denied'] } }];
    case 'active-approved':
      return [{ status: { in: ['approved', 'active'] } }];
    case 'approved':
      return [{ status: { in: ['approved'] } }];
    case 'active':
      return [{ status: { in: ['active'] } }];
    case 'pending':
      return [{ status: { in: ['pending'] } }];
    case 'denied':
      return [{ status: { in: ['denied'] } }];
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

      ...(params.type_name ? [{ type_name: params.type_name }] : []),
      ...(params.area_name ? [{ area_name: params.area_name }] : []),
      ...(params.admin_name ? [{ admin_name: params.admin_name }] : []),
      ...(params.zone_number ? [{ zone_number: params.zone_number }] : []),
      ...(params.subtype_name ? [{ subtype_name: params.subtype_name }] : []),
      ...(params.province_name ? [{ province_name: params.province_name }] : []),
      ...(params.city_name ? [{ city_name: params.city_name }] : []),
    ],
  };

  return where;
};
