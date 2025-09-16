import prisma from '../../../lib/prisma';

export async function fetchManyAdminsService() {
  const admins = await prisma.administration.findMany({
    include: {
      cities: true,
      licences: true,
      pos: true,
    },
  });

  return admins;
}
