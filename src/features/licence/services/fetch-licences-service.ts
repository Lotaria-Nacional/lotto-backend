import prisma from '../../../lib/prisma';
import { buildLicenceWhereInput } from '../utils/filters';
import { PaginationParams } from '../../../@types/pagination-params';

export async function fetchLicencesService(params: PaginationParams) {
  const where = buildLicenceWhereInput(params);

  console.log(params);

  const offset = (params.page - 1) * params.limit;

  const licences = await prisma.licence.findMany({
    where,
    skip: offset,
    take: params.limit,
    orderBy: { emitted_at: 'desc' },
    include: {
      admin: { select: { id: true, name: true } },
      pos: { select: { id: true } },
    },
    omit: { admin_name: true },
  });

  const nextPage = licences.length === params.limit ? params.page + 1 : null;

  return { data: licences, nextPage };
}
