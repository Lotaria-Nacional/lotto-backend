import z from 'zod';
import { Agent } from '../../agent/@types/agent.t';
import { simCardSchema } from '../../sim-card/@types/sim-card.t';

export const terminalStatusSchema = z.enum(['ready', 'training', 'stock', 'broken', 'maintenance', 'on_field']);

export const terminalSchema = z.object({
  id: z.uuid(),
  device_id: z.string(),
  serial: z.string(),
  note: z.string().optional(),
  sim_card: simCardSchema.optional(),
  status: terminalStatusSchema,
  created_at: z.date(),
  arrived_at: z.date().optional(),
  leaved_at: z.date().optional(),
});

export type Terminal = z.infer<typeof terminalSchema> & { agent?: Agent };
export type TerminalStatus = z.infer<typeof terminalStatusSchema>;
