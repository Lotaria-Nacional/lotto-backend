import prisma from '../../../lib/prisma';

export async function getAgentsInfoService() {
  const total = await prisma.agent.count({ where: { status: { in: ['active', 'approved', 'blocked'] } } });

  const approved = await prisma.agent.count({ where: { status: 'approved' } });
  const active = await prisma.agent.count({ where: { status: 'active' } });
  const ready = await prisma.agent.count({ where: { status: 'ready' } });
  const scheduled = await prisma.agent.count({ where: { status: 'scheduled' } });

  const denied = await prisma.agent.count({ where: { status: 'denied' } });
  const blocked = await prisma.agent.count({ where: { status: 'blocked' } });
  const discontinued = await prisma.agent.count({ where: { status: 'discontinued' } });

  return { total, approved, active, blocked, discontinued, ready, scheduled, denied };
}
