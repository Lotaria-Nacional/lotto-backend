import { Prisma } from '@prisma/client';
import { CreateAuditLogDTO } from '../schemas/create-audit-log.schema';

export async function createAuditLogService(tx: Prisma.TransactionClient, data: CreateAuditLogDTO) {
  return await tx.auditLog.create({
    data: {
      user_name: data.user_name,
      user_email: data.user_email,
      action: data.action,
      entity: data.entity,
      changes: data.changes,
    },
  });
}
