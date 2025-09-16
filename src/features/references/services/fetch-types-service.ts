import prisma from '../../../lib/prisma';

export async function fetchManyTypesService() {
  const types = await prisma.type.findMany({
    include: {
      subtypes: true,
    },
  });

  return types;
}
