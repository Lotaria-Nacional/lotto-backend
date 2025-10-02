import redis from '../../../lib/redis';
import prisma from '../../../lib/prisma';

export async function fetchActitiviesService() {
  const cacheKey = 'activities';

  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const activities = await prisma.agentActivity.findMany({
    include: {
      activities: true,
    },
  });

  if (activities.length > 0) {
    await redis.set(cacheKey, JSON.stringify(activities));
  }

  return activities;
}
