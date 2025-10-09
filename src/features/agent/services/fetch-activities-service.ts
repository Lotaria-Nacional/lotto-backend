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

export async function fetchActivitiesService(params?: FetchActivitiesParams): Promise<FetchActivitiesResponse> {
  const q = params?.query;
  const date = params?.date;

  let filters: Prisma.AgentDailyBalanceWhereInput[] = [];

  if (q) {
    filters.push({ agentId: { contains: params.query, mode: 'insensitive' } });
  }

  if (date) {
    const start = new Date(date);
    const end = new Date(date);

    start.setHours(0, 0, 0, 0);

    console.log({ start, end });

    filters.push({
      date: {
        gte: start,
        lte: end,
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
