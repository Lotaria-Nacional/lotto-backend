import redis from '../../../lib/redis';
import prisma from '../../../lib/prisma';
import { Prisma } from '@prisma/client';
import { detectCsvType } from '../utils/detect-csv-type';
import { AgentActivity } from '../../../@types/activies';
import { processKoral } from '../utils/process-koral-play';
import { processAfrimoney } from '../utils/process-afrimoney';

export async function importActitiviesService(files: Express.Multer.File[]): Promise<AgentActivity[]> {
  const allResults: AgentActivity[] = [];

  for (const file of files) {
    const type = await detectCsvType(file);

    if (type === 'AFRIMONEY') {
      const afr = await processAfrimoney(file);
      allResults.push(...afr);
    }

    if (type === 'KORAL-PLAY') {
      const koral = await processKoral(file);
      allResults.push(...koral);
    }
  }

  // Agrupar final por agentId + date
  const grouped: Record<string, AgentActivity> = {};

  for (const act of allResults) {
    if (!grouped[act.agentId]) {
      grouped[act.agentId] = {
        agentId: act.agentId,
        area: act.area,
        zone: act.zone,
        actualBalance: '0',
        activities: [],
      };
    }

    for (const a of act.activities) {
      // Verifica se já existe activity com a mesma data
      const existing = grouped[act.agentId].activities.find((ac) => ac.date === a.date);

      if (existing) {
        // Se já existe, soma os valores
        existing.debt = (parseFloat(existing.debt) + parseFloat(a.debt)).toString();
        existing.deposit = (parseFloat(existing.deposit) + parseFloat(a.deposit)).toString();
        existing.balance = (parseFloat(existing.balance) + parseFloat(a.balance)).toString();
      } else {
        grouped[act.agentId].activities.push(a);
      }
    }

    // Atualiza saldo final (soma de todos os balances)
    const total = grouped[act.agentId].activities.reduce((acc, a) => acc + parseFloat(a.balance), 0);
    grouped[act.agentId].actualBalance = total.toString();
  }

  // Persistir no banco
  for (const agent of Object.values(grouped)) {
    await prisma.agentActivity.upsert({
      where: { id: agent.agentId },
      update: {
        area: agent.area,
        zone: agent.zone,
        actualBalance: new Prisma.Decimal(agent.actualBalance),
        activities: {
          create: agent.activities.map((a) => ({
            debt: new Prisma.Decimal(a.debt),
            deposit: new Prisma.Decimal(a.deposit),
            balance: new Prisma.Decimal(a.balance),
            date: a.date,
          })),
        },
      },
      create: {
        id: agent.agentId,
        area: agent.area,
        zone: agent.zone,
        actualBalance: new Prisma.Decimal(agent.actualBalance),
        activities: {
          create: agent.activities.map((a) => ({
            debt: new Prisma.Decimal(a.debt),
            deposit: new Prisma.Decimal(a.deposit),
            balance: new Prisma.Decimal(a.balance),
            date: a.date,
          })),
        },
      },
    });
  }

  await redis.del('activities');

  return Object.values(grouped);
}
