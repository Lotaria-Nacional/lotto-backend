import prisma from '../../../lib/prisma';

export async function getTerminalsInfoService() {
  const total = await prisma.terminal.count();

  const stock = await prisma.terminal.count({ where: { status: 'stock' } });
  const on_field = await prisma.terminal.count({ where: { status: 'on_field' } });
  const maintenance = await prisma.terminal.count({ where: { status: 'broken' } });
  const fixed = await prisma.terminal.count({ where: { status: 'fixed' } });

  return { total, stock, on_field, maintenance, fixed };
}
