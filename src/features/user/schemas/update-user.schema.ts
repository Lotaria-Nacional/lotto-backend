import z from 'zod';
import { createUserSchema } from './create-user.schema';
import { currentUserSchema } from '../../../@types/user';

export const updateUserSchema = createUserSchema.partial().extend({
  id: z.uuid('O id é obrigatório.'),
  user: currentUserSchema,
});

export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
