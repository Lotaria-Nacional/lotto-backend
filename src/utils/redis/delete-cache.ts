import redis from '../../lib/redis';

/**
 * Deleta todas as chaves no Redis que casam com o padrão fornecido
 */
export async function deleteCache(pattern: string): Promise<void> {
  try {
    let cursor = '0';
    do {
      const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;

      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== '0');
  } catch (error) {
    console.error(`Erro ao fazer scan e deletar chaves com padrão [${pattern}]:`, error);
  }
}
