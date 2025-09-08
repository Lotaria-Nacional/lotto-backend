import prisma from '../../../lib/prisma';
import { RedisKeys } from '../../../utils/redis/keys';
import { getCache } from '../../../utils/redis/get-cache';
import { setCache } from '../../../utils/redis/set-cache';
import { PaginationParams } from '../../../schemas/common/query.schema';

export async function fetchManyAuditLogs(params: PaginationParams) {
  const cacheKey = RedisKeys.auditLogs.all();

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const offset = (params.page - 1) * params.limit;

  const auditLogs = await prisma.auditLog.findMany({
    skip: offset,
    take: params.limit,
    orderBy: { created_at: 'desc' },
  });

  const nextPage = auditLogs.length === params.limit ? params.page + 1 : null;

  if (auditLogs.length > 0) {
    await setCache(cacheKey, auditLogs);
  }

  return { data: auditLogs, nextPage };
}
