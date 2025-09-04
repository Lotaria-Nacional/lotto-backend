import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { getCache, RedisKeys, setCache } from '../../../utils/redis';

export async function getLicenceService(id: string) {
  const cacheKey = RedisKeys.licences.byId(id);
  const cached = await getCache(cacheKey);

  if (cached) return cached;

  const licence = await prisma.licence.findUnique({
    where: { id },
    include: { admin: { select: { id: true, name: true } } },
    omit: { admin_id: true },
  });

  if (!licence) throw new NotFoundError('Licença não encontrada');

  await setCache(cacheKey, licence);

  return licence;
}
