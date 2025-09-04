import z from 'zod';
import { membershipSchema } from './membership.t';
import { groupPermissionSchema } from './group-permission.t';

export const groupSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string().optional(),
  memberships: z.array(membershipSchema),
  permissions: z.array(groupPermissionSchema),
  created_at: z.date().default(new Date()),
  updated_at: z.date().optional(),
});

export type Group = z.infer<typeof groupSchema>;
