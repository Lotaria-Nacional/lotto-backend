import z from 'zod';
import { createSimCardSchema } from './create-sim-card.schema';
import { currentUserSchema } from '../../../@types/user';

export const updateSimCardSchema = createSimCardSchema.partial().extend({
  id: z.uuid(),
  user: currentUserSchema,
});

export type UpdateSimCardDTO = z.infer<typeof updateSimCardSchema>;
