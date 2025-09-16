import prisma from '../../../lib/prisma';

export async function fetchManyProvincesService() {
  const provinces = await prisma.province.findMany({
    include: {
      cities: {
        include: {
          area: true,
          zone: true,
          administration: true,
          pos: true,
        },
      },
      pos: true,
    },
  });

  return provinces;
}
