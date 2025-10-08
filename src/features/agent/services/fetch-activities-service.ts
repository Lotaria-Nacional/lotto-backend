import prisma from '../../../lib/prisma';

export async function fetchActivitiesService() {
  const afrimoneyActivities = await prisma.afrimoneyActivity.findMany();
  const koralPlayActivities = await prisma.koralplayActivity.findMany();

  // Mapa: agentId -> dados do agente
  const agentsMap = new Map<string, any>();

  // --- Processar Afrimoney ---
  for (const afri of afrimoneyActivities) {
    const date = afri.date;
    const agentId = afri.remarks;
    if (!agentId || !date) continue;

    if (!agentsMap.has(agentId)) {
      agentsMap.set(agentId, {
        agentId,
        groupName: ' ',
        areaName: 'A',
        summary: new Map<string, { deposit: number; debt: number }>(),
      });
    }

    const agentData = agentsMap.get(agentId)!;
    const entry = agentData.summary.get(date) || { deposit: 0, debt: 0 };
    entry.deposit += Number(afri.transferValue) || 0;
    agentData.summary.set(date, entry);
  }

  // --- Processar KoralPlay ---
  for (const koral of koralPlayActivities) {
    const date = koral.date;
    const agentId = koral.staffReference;
    if (!agentId || !date) continue;

    if (!agentsMap.has(agentId)) {
      agentsMap.set(agentId, {
        agentId,
        groupName: koral.groupName || ' ',
        areaName: 'A',
        summary: new Map<string, { deposit: number; debt: number }>(),
      });
    }

    const agentData = agentsMap.get(agentId)!;
    agentData.groupName = koral.groupName || agentData.groupName;

    const entry = agentData.summary.get(date) || { deposit: 0, debt: 0 };
    entry.debt += Number(koral.ggrAmount) || 0;
    agentData.summary.set(date, entry);
  }

  // --- Calcular saldos diários (considerando saldo anterior) ---
  const result = Array.from(agentsMap.values()).map((agent) => {
    const sortedDates = Array.from(agent.summary.keys() as Iterable<string>).sort((a, b) => {
      const [da, ma, ya] = a.split('-').map(Number);
      const [db, mb, yb] = b.split('-').map(Number);
      return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime();
    });

    let previousBalance = 0;
    const summary = sortedDates.map((date) => {
      const { deposit, debt } = agent.summary.get(date)!;
      const balance = previousBalance + debt - deposit;
      previousBalance = balance;
      return { date, deposit, debt, balance };
    });

    return {
      agentId: agent.agentId,
      groupName: agent.groupName,
      areaName: agent.areaName,
      actualBalance: previousBalance,
      summary,
    };
  });

  // --- Obter todas as datas únicas existentes ---
  const allDates = new Set<string>();
  afrimoneyActivities.forEach((a) => a.date && allDates.add(a.date));
  koralPlayActivities.forEach((k) => k.date && allDates.add(k.date));

  const sortedAllDates = Array.from(allDates).sort((a, b) => {
    const [da, ma, ya] = a.split('-').map(Number);
    const [db, mb, yb] = b.split('-').map(Number);
    return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime();
  });

  // --- Retornar agentes + datas únicas ---
  return {
    dates: sortedAllDates,
    agents: result.sort((a, b) => (a.groupName || '').localeCompare(b.groupName || '')),
  };
}
