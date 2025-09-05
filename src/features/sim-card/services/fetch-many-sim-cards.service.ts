import prisma from '../../../lib/prisma';

export async function fetchManySimCardsService() {
  const simCards = await prisma.simCard.findMany({
    orderBy: {
      created_at: 'desc',
    },
    include: {
      terminal: true,
    },
  });

  return { simCards };
}
