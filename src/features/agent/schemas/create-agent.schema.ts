import z from 'zod';
import { agentType, genre } from '../@types/agent.t';
import { currentUserSchema } from '../../../@types/user';

export const createAgentSchema = z.object({
  genre: genre,
  type: agentType,
  first_name: z.string({ error: 'O nome é obrigatório' }),
  last_name: z.string({ error: 'O sobrenome é obrigatório' }),
  training_date: z.coerce.date({ error: 'A data de formação é obrigatória' }),

  pos_id: z.uuid().optional(),
  terminal_id: z.uuid().optional(),
  bi_number: z.string().optional(),
  id_reference: z.number().optional(),
  phone_number: z.coerce.number().optional(),

  user: currentUserSchema,
});

export type CreateAgentDTO = z.infer<typeof createAgentSchema>;
