import { Prisma } from '@prisma/client';
import prisma from '../../../lib/prisma';
import { detectCsvType } from '../utils/detect-csv-type';
import { AgentActivity } from '../../../@types/activies';
import { processKoral } from '../utils/process-koral-play';
import { processAfrimoney } from '../utils/process-afrimoney';

export async function importActitiviesService(
  files: Express.Multer.File[],
  onProgress?: (percent: number) => void
): Promise<AgentActivity[]> {
  const allResults: AgentActivity[] = [];

  // 🔹 Processar todos os ficheiros em memória
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

  // 🔹 Agrupar final por agentId
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
      const existing = grouped[act.agentId].activities.find((ac) => ac.date === a.date);

      if (existing) {
        existing.debt = (parseFloat(existing.debt) + parseFloat(a.debt)).toString();
        existing.deposit = (parseFloat(existing.deposit) + parseFloat(a.deposit)).toString();
        existing.balance = (parseFloat(existing.balance) + parseFloat(a.balance)).toString();
      } else {
        grouped[act.agentId].activities.push(a);
      }
    }

    const totalBalance = grouped[act.agentId].activities.reduce((acc, a) => acc + parseFloat(a.balance), 0);
    grouped[act.agentId].actualBalance = totalBalance.toString();
  }

  // 🔹 Contagem total de registos que vão ser inseridos
  const totalRecords = Object.values(grouped).reduce((acc, agent) => acc + agent.activities.length, 0);
  let savedRecords = 0;

  // 🔹 Persistir no banco de dados (com progresso a cada registo salvo)
  for (const agent of Object.values(grouped)) {
    await prisma.agentActivity.upsert({
      where: { id: agent.agentId },
      update: {
        area: agent.area,
        zone: agent.zone,
        actualBalance: new Prisma.Decimal(agent.actualBalance),
        activities: {
          create: agent.activities.map((a) => {
            return {
              debt: new Prisma.Decimal(a.debt),
              deposit: new Prisma.Decimal(a.deposit),
              balance: new Prisma.Decimal(a.balance),
              date: a.date,
            };
          }),
        },
      },
      create: {
        id: agent.agentId,
        area: agent.area,
        zone: agent.zone,
        actualBalance: new Prisma.Decimal(agent.actualBalance),
        activities: {
          create: agent.activities.map((a) => {
            return {
              debt: new Prisma.Decimal(a.debt),
              deposit: new Prisma.Decimal(a.deposit),
              balance: new Prisma.Decimal(a.balance),
              date: a.date,
            };
          }),
        },
      },
    });
    savedRecords += agent.activities.length;
    if (onProgress) {
      const percent = Math.min(100, Math.round((savedRecords / totalRecords) * 100));
      onProgress(percent);
    }
  }

  // 🔹 Garantir 100% no final
  if (onProgress) onProgress(100);

  return Object.values(grouped);
}
