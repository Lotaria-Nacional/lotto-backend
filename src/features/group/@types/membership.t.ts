import z from 'zod';
import { userSchema } from '../../user/@types/user.t';

export const membershipSchema = z.object({
  user_id: z.string(),
  group_id: z.string(),
  user: userSchema,
});
export type Membership = z.infer<typeof membershipSchema>;
