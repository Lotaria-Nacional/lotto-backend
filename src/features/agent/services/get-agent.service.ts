import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { RedisKeys } from '../../../utils/redis/keys';
import { getCache } from '../../../utils/redis/get-cache';
import { setCache } from '../../../utils/redis/set-cache';

export async function getAgentService(id: string) {
  const cacheKey = RedisKeys.agents.byId(id);

  const cached = await getCache(cacheKey);

  if (cached) return cached;

  const agent = await prisma.agent.findUnique({
    where: { id },
    include: {
      pos: {
        select: {
          area: { select: { name: true } },
          zone: { select: { number: true } },
          type: { select: { name: true } },
          subtype: { select: { name: true } },
          province: { select: { name: true } },
          city: { select: { name: true } },
          licence: { select: { reference: true } },
        },
      },
      terminal: {
        select: {
          serial: true,
          device_id: true,
          sim_card: {
            select: {
              number: true,
              pin: true,
              puk: true,
            },
          },
        },
      },
    },
  });

  if (!agent) throw new NotFoundError('Agente não encontrado');

  await setCache(cacheKey, agent);

  return agent;
}
