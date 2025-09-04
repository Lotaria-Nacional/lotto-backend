import prisma from '../../../lib/prisma';
import { FetchSimCardsResponse } from '../schemas/fetch-sim-cards-response.schema';

export async function fetchManySimCardsService(): Promise<FetchSimCardsResponse> {
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
