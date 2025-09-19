import { Prisma, LicenceStatus } from '@prisma/client';
import { PaginationParams } from '../../../@types/pagination-params';

export const createLicenceSearchFilters = (query: string): Prisma.LicenceWhereInput[] => {
  const filters: Prisma.LicenceWhereInput[] = [];

  filters.push({ number: { contains: query, mode: 'insensitive' } });
  filters.push({ reference: { contains: query, mode: 'insensitive' } });
  filters.push({ coordinates: { contains: query, mode: 'insensitive' } });
  filters.push({ description: { contains: query, mode: 'insensitive' } });
  filters.push({ admin: { name: { contains: query, mode: 'insensitive' } } });

  const parsedDate = new Date(query);
  if (!isNaN(parsedDate.getTime())) {
    const start = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate(), 0, 0, 0, 0);
    const end = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate(), 23, 59, 59, 999);

    filters.push(
      { emitted_at: { gte: start, lte: end } },
      { expires_at: { gte: start, lte: end } } // opcional, se quiser filtrar também pelo vencimento
    );
  }

  return filters;
};

export const buildLicenceWhereInput = (params: PaginationParams): Prisma.LicenceWhereInput => {
  const filters = createLicenceSearchFilters(params.query);

  let where = {
    ...(filters.length ? { OR: filters } : {}),

    ...(params.admin_name && { admin: { name: params.admin_name } }),

    ...(params.status && { status: params.status as LicenceStatus }),
  };

  return where;
};
