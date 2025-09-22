import prisma from '../../../lib/prisma';

export async function getPosInfoService() {
  const total = await prisma.pos.count();

  const licenced = await prisma.pos.count({ where: { licence_reference: { not: null } } });
  const approved = await prisma.pos.count({ where: { status: 'approved' } });

  return { total, approved, licenced };
}
