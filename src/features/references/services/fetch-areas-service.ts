import prisma from '../../../lib/prisma';

export async function fetchManyAreasService() {
  const areas = await prisma.area.findMany({
    include: {
      cities: {
        include: {
          zone: true,
          administration: true,
        },
      },
    },
  });

  return areas;
}
