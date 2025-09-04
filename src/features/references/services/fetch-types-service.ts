import prisma from '../../../lib/prisma';
import redis from '../../../lib/redis';
import { oneDayFromNowInMs } from '../../../utils/date';

export async function fetchManyTypesService() {
  const cacheKey = 'types';
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const types = await prisma.type.findMany({
      select: {
        id: true,
        name: true,
        subtypes: { select: { id: true, name: true, type_id: true } },
      },
    });

    if (types.length > 0) {
      await redis.set(cacheKey, JSON.stringify(types), 'EX', oneDayFromNowInMs);
    }

    return types;
  } catch (error) {
    console.error('Error on FecthManyTypesService : ', error);
    throw error;
  }
}
