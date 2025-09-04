import prisma from '../../../lib/prisma';
import redis from '../../../lib/redis';
import { oneDayFromNowInMs } from '../../../utils/date';

export async function fetchManyProvincesService() {
  const cacheKey = 'provinces';
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const provinces = await prisma.province.findMany({
      select: {
        id: true,
        name: true,
        cities: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (provinces.length > 0) {
      await redis.set(cacheKey, JSON.stringify(provinces), 'EX', oneDayFromNowInMs);
    }

    return provinces;
  } catch (error) {
    console.error('Error on FecthManyProvincesService : ', error);
    throw error;
  }
}
