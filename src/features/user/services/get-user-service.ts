import { NotFoundError } from '../../../errors';
import prisma from '../../../lib/prisma';
import { getCache } from '../../../utils/redis/get-cache';
import { RedisKeys } from '../../../utils/redis/keys';
import { setCache } from '../../../utils/redis/set-cache';

export async function getUserService(id: string) {
  const cacheKey = RedisKeys.users.byId(id);
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const existingUser = await prisma.user.findUnique({ where: { id } });

  if (!existingUser) throw new NotFoundError('Usuário não encontrado.');

  await setCache(cacheKey, existingUser);

  return existingUser;
}
