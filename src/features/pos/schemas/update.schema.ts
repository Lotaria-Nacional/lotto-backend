import z from 'zod';
import { posStatus } from '../@types/pos.t';
import { createPosSchema } from './create-pos.schema';
import { currentUserSchema } from '../../../@types/user';

export const updatePosSchema = createPosSchema.partial().extend({
  id: z.uuid(),
  user: currentUserSchema,
  status: posStatus.optional(),
  licence_id: z.uuid().nullable().optional(),
});

export type UpdatePosDTO = z.infer<typeof updatePosSchema>;
