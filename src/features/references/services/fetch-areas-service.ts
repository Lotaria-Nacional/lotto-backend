import prisma from '../../../lib/prisma';
import redis from '../../../lib/redis';
import { oneDayFromNowInMs } from '../../../utils/date';

export async function fetchManyAreasService() {
  const cacheKey = 'areas';
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const areas = await prisma.area.findMany({
      select: { id: true, name: true, zones: { select: { id: true, number: true } } },
    });

    if (areas.length > 0) {
      await redis.set(cacheKey, JSON.stringify(areas), 'EX', oneDayFromNowInMs);
    }

    return areas;
  } catch (error) {
    console.error('Error on FecthManyAreasService : ', error);
    throw error;
  }
}
