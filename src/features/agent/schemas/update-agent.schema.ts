import z from 'zod';
import { createAgentSchema } from './create-agent.schema';

export const updateAgentSchema = createAgentSchema
  .partial()
  .extend({
    id: z.uuid(),
    afrimoney_number: z.coerce.number().optional(),
  })
  .omit({ type: true })
  .required({ user: true });

export type UpdateAgentDTO = z.infer<typeof updateAgentSchema>;
