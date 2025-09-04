import z from 'zod';
import { currentUserSchema } from '../../../@types/user';

export const createSimCardSchema = z.object({
  number: z.coerce.number().int(),
  pin: z.coerce.number().int().optional(),
  puk: z.coerce.number().int().optional(),
  terminal_id: z.uuid().optional(),
  user: currentUserSchema,
});

export type CreateSimCardDTO = z.infer<typeof createSimCardSchema>;
