import prisma from '../../../lib/prisma';

export async function getAgentsInfoService() {
  const total = await prisma.agent.count();

  const approved = await prisma.agent.count({ where: { status: 'approved' } });
  const active = await prisma.agent.count({ where: { status: 'active' } });
  const blocked = await prisma.agent.count({ where: { status: 'denied' } });
  const discontinued = await prisma.agent.count({ where: { status: 'discontinued' } });
  const ready = await prisma.agent.count({ where: { status: 'ready' } });
  const scheduled = await prisma.agent.count({ where: { status: 'scheduled' } });

  return { total, approved, active, blocked, discontinued, ready, scheduled };
}
