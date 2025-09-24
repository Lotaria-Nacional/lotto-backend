import prisma from '../../../lib/prisma';
import { PaginationParams } from '../../../schemas/common/query.schema';

export async function fetchAuditLogsService(params: PaginationParams) {
  const offset = (params.page - 1) * params.limit;

  const auditLogs = await prisma.auditLog.findMany({
    skip: offset,
    take: params.limit,
    orderBy: { created_at: 'desc' },
  });

  const nextPage = auditLogs.length === params.limit ? params.page + 1 : null;

  return { data: auditLogs, nextPage };
}
