import redis from '../../lib/redis';

/**
 * Obter os dados do Redis
 */
export async function getCache<T = any>(key: string): Promise<T | null> {
  const value = await redis.get(key);
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`Erro ao fazer parse do cache da chave "${key}":`, error);
    return null;
  }
}
