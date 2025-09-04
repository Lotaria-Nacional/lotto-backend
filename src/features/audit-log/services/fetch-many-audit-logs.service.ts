import prisma from '../../../lib/prisma';
import { getCache } from '../../../utils/redis/get-cache';
import { RedisKeys } from '../../../utils/redis/keys';
import { setCache } from '../../../utils/redis/set-cache';

export async function fetchManyAuditLogs() {
  const cacheKey = RedisKeys.auditLogs.all();

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const auditLogs = await prisma.auditLog.findMany({
    orderBy: { created_at: 'desc' },
  });

  if (auditLogs.length > 0) {
    await setCache(cacheKey, auditLogs);
  }

  return auditLogs;
}
