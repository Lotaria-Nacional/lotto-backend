import prisma from '../../../lib/prisma';
import { buildTermninalWhereInput } from '../utils/filters';
import { PaginationParams } from '../../../@types/pagination-params';

export async function fetchTerminalsService(params: PaginationParams) {
  const where = buildTermninalWhereInput(params);

  const offset = (params.page - 1) * params.limit;

  const terminals = await prisma.terminal.findMany({
    where,
    take: params.limit,
    skip: offset,
    orderBy: { created_at: 'desc' },
    include: {
      sim_card: {
        select: {
          id: true,
          number: true,
          pin: true,
          puk: true,
        },
      },
      agent: {
        select: {
          id: true,
          id_reference: true,
          first_name: true,
          last_name: true,
        },
      },
    },
  });

  const nextPage = terminals.length === params.limit ? params.page + 1 : null;

  return { data: terminals, nextPage };
}
