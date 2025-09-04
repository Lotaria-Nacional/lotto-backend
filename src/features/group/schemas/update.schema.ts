import z from 'zod';
import { createGroupSchema } from './create.schema';

export const updateGroupSchema = createGroupSchema.partial().extend({
  id: z.uuid(),
});

export type UpdateGroupDTO = z.infer<typeof updateGroupSchema>;
