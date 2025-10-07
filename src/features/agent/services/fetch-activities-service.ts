import prisma from '../../../lib/prisma';
import dayjs from 'dayjs';

export async function fetchActivitiesService() {
  const activities = new Map<string, any[]>();

  const afrimoneyActivities = await prisma.afrimoneyActivity.findMany();
  const koralPlayActivities = await prisma.koralplayActivity.findMany();

  const addActivity = (agentId: string | null, activity: any) => {
    if (!agentId) return;
    if (!activities.has(agentId)) {
      activities.set(agentId, []);
    }
    activities.get(agentId)!.push(activity);
  };

  // --- Afrimoney ---
  for (const afri of afrimoneyActivities) {
    const formattedDate = dayjs(afri.transferDate).format('DD-MM-YYYY');

    addActivity(afri.remarks, {
      source: 'afrimoney',
      value: Number(afri.transferValue) || 0,
      date: formattedDate,
    });
  }

  // --- KoralPlay ---
  for (const koral of koralPlayActivities) {
    // converter MM-DD-YYYY → DD-MM-YYYY
    const formattedDate = dayjs(koral.date, 'MM-DD-YYYY').format('DD-MM-YYYY');

    addActivity(koral.staffReference, {
      source: 'koralplay',
      value: Number(koral.ggrAmount) || 0,
      date: formattedDate,
    });
  }

  // --- Agregar atividades por data ---
  const result = Array.from(activities.entries()).map(([agentId, acts]) => {
    const groupedByDate: Record<string, any[]> = {};

    for (const act of acts) {
      if (!groupedByDate[act.date]) {
        groupedByDate[act.date] = [];
      }
      groupedByDate[act.date].push(act);
    }

    // Calcular totais (debt, deposit, balance)
    const dailySummary = Object.entries(groupedByDate).map(([date, list]) => {
      const deposit = list
        .filter((a) => a.type === 'deposit' || a.source === 'afrimoney')
        .reduce((sum, a) => sum + a.value, 0);

      const debt = list
        .filter((a) => a.type === 'debt' || a.source === 'koralplay')
        .reduce((sum, a) => sum + a.value, 0);

      const balance = deposit - debt;

      return { date, deposit, debt, balance };
    });

    return { agentId, summary: dailySummary };
  });

  return result;
}
