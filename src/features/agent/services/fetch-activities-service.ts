import dayjs from 'dayjs';
import { Prisma } from '@prisma/client';
import prisma from '../../../lib/prisma';
import { FetchActivitiesParams } from '../controllers/fetch-activities-controller';

/** Tipos auxiliares */
export type AgentBalance = {
  date: string; // formato YYYY-MM-DD
  deposit: number;
  debt: number;
  balance: number;
};

export type AgentWithBalances = {
  id: string;
  zone: string;
  area: string;
  summary: AgentBalance[];
};

export type FetchActivitiesResponse = {
  dates: string[];
  agents: AgentWithBalances[];
};

type AgentActivityStatus = 'active' | 'blocked';

export async function fetchActivitiesService(params?: FetchActivitiesParams): Promise<FetchActivitiesResponse> {
  const q = params?.query?.normalize('NFD');
  const status = params?.status;
  const start = params?.start;
  const end = params?.end;

  let filters: Prisma.AgentDailyBalanceWhereInput[] = [];

  if (q) {
    console.log(q);
    filters.push({
      OR: [
        { agentId: { contains: q, mode: 'insensitive' } },
        { agent: { zone: { contains: q, mode: 'insensitive' } } },
        { agent: { area: { contains: q, mode: 'insensitive' } } },
      ],
    });
  }

  if (status) {
    filters.push({ agent: { status: status as AgentActivityStatus } });
  }

  if (start || end) {
    const startDate = start ? new Date(start) : undefined;
    const endDate = end ? new Date(end) : undefined;

    startDate?.setHours(0, 0, 0, 0);

    filters.push({
      date: {
        gte: startDate,
        lte: endDate,
      },
    });
  }

  const balances = await prisma.agentDailyBalance.findMany({
    where: { AND: filters },
    include: { agent: true },
    orderBy: [{ agentId: 'asc' }, { date: 'asc' }],
  });

  const agentsMap = new Map<string, any>();
  const allDates = new Set<string>();

  for (const b of balances) {
    const date = dayjs(b.date).format('YYYY-MM-DD');
    allDates.add(date);

    if (!agentsMap.has(b.agentId)) {
      agentsMap.set(b.agentId, {
        id: b.agentId,
        zone: b.agent.zone,
        area: b.agent.area,
        status: b.agent.status,
        summary: [],
      });
    }

    agentsMap.get(b.agentId).summary.push({
      date,
      deposit: Number(b.deposit),
      debt: Number(b.debt),
      balance: Number(b.balance),
    });
  }

  return {
    dates: Array.from(allDates).sort(),
    agents: Array.from(agentsMap.values()),
  };
}
