import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { RedisKeys, getCache, setCache } from '../../../utils/redis';

export async function getPosService(id: string) {
  const cacheKey = RedisKeys.pos.byId(id);

  const cached = await getCache(cacheKey);

  if (cached) return cached;

  const pos = await prisma.pos.findUnique({
    where: { id },
    include: {
      licence: true,
      admin: {
        select: {
          name: true,
        },
      },
      agent: {
        select: {
          id: true,
          id_reference: true,
          first_name: true,
          last_name: true,
          terminal: {
            select: {
              serial: true,
              device_id: true,
              sim_card: true,
            },
          },
        },
      },
      province: true,
    },
  });

  if (!pos) throw new NotFoundError('Pos não encontrado');

  await setCache(cacheKey, pos);

  return pos;
}
