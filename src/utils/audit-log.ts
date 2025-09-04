import { Prisma } from '@prisma/client';
import { AuthPayload } from '../@types/auth-payload';
import { Module } from '../features/group/@types/modules.t';
import { Action } from '../features/group/@types/actions.t';
import { createAuditLogService } from '../features/audit-log/services/create-audit-log.service';

type AuditOptions<T> = {
  entity: Module;
  user: AuthPayload;
  before?: T | null;
  after?: T | null;
};

export async function audit<T>(tx: Prisma.TransactionClient, action: Action, options: AuditOptions<T>) {
  await createAuditLogService(tx, {
    action,
    entity: options.entity,
    user_name: options.user.name,
    user_email: options.user.email,
    changes: {
      before: options.before ?? null,
      after: options.after ?? null,
    },
  });
}
