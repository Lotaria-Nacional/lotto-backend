import redis from '../../lib/redis';

/**
 * Seta um valor no Redis com expiração
 */
export async function setCache<T>(key: string, value: T, seconds = 60 * 5): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', seconds);
  } catch (error) {
    console.error(`Erro ao setar cache [${key}] no Redis:`, error);
  }
}
