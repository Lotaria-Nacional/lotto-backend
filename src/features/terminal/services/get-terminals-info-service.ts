import prisma from '../../../lib/prisma';

export async function getTerminalsInfoService() {
  const total = await prisma.terminal.count({ where: { status: { notIn: ['stock', 'discontinued'] } } });

  const stock = await prisma.terminal.count({ where: { status: 'stock' } });
  const ready = await prisma.terminal.count({ where: { status: 'ready' } });
  const delivered = await prisma.terminal.count({ where: { status: 'delivered' } });
  const on_field = await prisma.terminal.count({ where: { status: 'on_field' } });
  const broken = await prisma.terminal.count({ where: { status: 'broken' } });

  return { total, stock, on_field, ready, delivered, broken };
}
