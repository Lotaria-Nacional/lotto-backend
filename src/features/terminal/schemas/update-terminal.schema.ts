import z from 'zod';
import { currentUserSchema } from '../../../@types/user';

export const updateTerminalSchema = z.object({
  id: z.uuid(),
  note: z.string().optional(),
  agent_id: z.uuid().optional(),
  sim_card_id: z.uuid().optional(),
  leaved_at: z.coerce.date().optional(),
  user: currentUserSchema,
});

export type UpdateTerminalDTO = z.infer<typeof updateTerminalSchema>;
