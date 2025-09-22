import { Prisma, LicenceStatus } from '@prisma/client';
import { PaginationParams } from '../../../@types/pagination-params';

export const createLicenceSearchFilters = (query: string): Prisma.LicenceWhereInput[] => {
  const filters: Prisma.LicenceWhereInput[] = [];

  filters.push({ number: { contains: query, mode: 'insensitive' } });
  filters.push({ reference: { contains: query, mode: 'insensitive' } });
  filters.push({ coordinates: { contains: query, mode: 'insensitive' } });
  filters.push({ description: { contains: query, mode: 'insensitive' } });
  filters.push({ admin: { name: { contains: query, mode: 'insensitive' } } });

  return filters;
};

export const buildLicenceWhereInput = (params: PaginationParams): Prisma.LicenceWhereInput => {
  const filters = createLicenceSearchFilters(params.query);
  const filterByDate: Prisma.LicenceWhereInput[] = [];

  if (params.emitted_at) {
    const date = new Date(params.emitted_at);
    if (!isNaN(date.getTime())) {
      const start = new Date(date);
      const end = new Date(date);

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 9999);

      filterByDate.push({ emitted_at: { gte: start, lte: end } });
    }
  }

  if (params.expires_at) {
    const date = new Date(params.expires_at);
    if (!isNaN(date.getTime())) {
      const start = new Date(date);
      const end = new Date(date);

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 9999);

      filterByDate.push({ expires_at: { gte: start, lte: end } });
    }
  }

  console.log(params.status);

  let where: Prisma.LicenceWhereInput = {
    AND: [
      ...(filters.length ? [{ OR: filters }] : []),
      ...(params.admin_name ? [{ admin: { name: params.admin_name } }] : []),
      ...(params.status ? [{ status: params.status as LicenceStatus }] : []),
      ...filterByDate,
    ],
  };

  return where;
};
