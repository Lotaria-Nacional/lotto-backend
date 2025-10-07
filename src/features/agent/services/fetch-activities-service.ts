import prisma from '../../../lib/prisma';

export async function fetchActitiviesService() {
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

  for (const afri of afrimoneyActivities) {
    addActivity(afri.remarks, {
      source: 'Afrimoney',
      valu: afri.transferValue,
      date: afri.transferDate,
    });
  }

  for (const koralPlay of koralPlayActivities) {
    addActivity(koralPlay.staffReference, {
      source: 'Koral Play',
      valu: koralPlay.ggrAmount,
      date: koralPlay.date,
    });
  }

  const result = Array.from(activities.entries()).map(([agentId, acts]) => ({
    agentId,
    activities: acts,
  }));

  return result;
}
