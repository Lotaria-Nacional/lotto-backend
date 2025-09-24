import prisma from '../../../lib/prisma';
import { Terminal } from '@lotaria-nacional/lotto';
import { PaginationParams } from '../../../@types/pagination-params';

export type FetchTerminalsResponse = {
  data: Terminal[];
  nextPage?: number | null;
};

export async function fetchTerminalsHistoryService(params: PaginationParams) {
  const offset = (params.page - 1) * params.limit;

  const Terminals = await prisma.terminal.findMany({
    where: {
      status: { in: ['discontinued'] },
    },
    take: params.limit,
    skip: offset,
    orderBy: { created_at: 'desc' },
    select: {
      id: true,
      note: true,
      serial: true,
      status: true,
      device_id: true,
      leaved_at: true,
      arrived_at: true,
      sim_card: {
        select: {
          number: true,
        },
      },
    },
  });

  const nextPage = Terminals.length === params.limit ? params.page + 1 : null;

  return { data: Terminals, nextPage };
}
