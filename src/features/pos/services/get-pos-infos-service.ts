import prisma from '../../../lib/prisma';

export async function getPosInfoService() {
  const total = await prisma.pos.count({ where: { status: { notIn: ['pending'] } } });
  const licenced = await prisma.pos.count({ where: { licence_reference: { not: null } } });
  const active = await prisma.pos.count({ where: { status: 'active' } });

  return { total, active, licenced };
}
