import prisma from '../../../lib/prisma';
import { getCache } from '../../../utils/redis/get-cache';
import { RedisKeys } from '../../../utils/redis/keys';
import { setCache } from '../../../utils/redis/set-cache';

export async function fetchManyAdminsService() {
  const cacheKey = RedisKeys.admins.all();

  const cached = await getCache(cacheKey);

  if (cached) return cached;

  const admins = await prisma.administration.findMany({
    select: {
      id: true,
      name: true,
      licences: {
        select: {
          id: true,
          reference: true,
          status: true,
        },
      },
    },
  });

  if (admins.length > 0) await setCache(cacheKey, admins);

  return admins;
}
