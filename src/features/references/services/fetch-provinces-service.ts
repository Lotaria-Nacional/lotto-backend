import prisma from '../../../lib/prisma';

export async function fetchManyProvincesService() {
  const provinces = await prisma.province.findMany({
    include: {
      cities: {
        orderBy: { name: 'asc' },
        include: {
          area: true,
          zone: true,
          pos: true,
          administration: true,
        },
      },
      pos: true,
    },
  });

  return provinces;
}
