import z from 'zod';
import { moduleSchema } from '../../group/@types/modules.t';
import { actionsSchema } from '../../group/@types/actions.t';

const auditLogchanges = z.object({
  before: z.record(z.string(), z.any()).nullable().optional(),
  after: z.record(z.string(), z.any()).nullable().optional(),
});

export const createAuditLogSchema = z.object({
  entity: moduleSchema,
  user_name: z.string(),
  user_email: z.email(),
  action: actionsSchema,
  changes: auditLogchanges,
});

export type AuditLogChanges = z.infer<typeof auditLogchanges>;
export type CreateAuditLogDTO = z.infer<typeof createAuditLogSchema>;
