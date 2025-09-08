import { terminalStatusSchema } from '@lotaria-nacional/lotto';
import { z } from 'zod';

export const terminalBulkSchema = z.object({
  serial: z.string().min(1),
  device_id: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  status: terminalStatusSchema.optional(),
  arrived_at: z.coerce.date(),
  leaved_at: z.coerce.date().optional().nullable(),
  agent_id: z.string().optional().nullable(),
});
