import prisma from '../../../lib/prisma';

export async function fecthBoundedPosService() {
  const pos = await prisma.pos.findMany({
    take: 40,
    where: {
      status: {
        in: ['active', 'approved'],
      },
    },
    orderBy: {
      created_at: 'desc',
    },
    include: {
      licence: true,
      agent: {
        select: {
          id: true,
          id_reference: true,
          first_name: true,
          last_name: true,
          terminal: { select: { id: true, serial: true } },
        },
      },
      admin: true,
      area: true,
      zone: true,
      type: true,
      subtype: true,
      province: true,
      city: true,
    },
  });

  return pos;
}
