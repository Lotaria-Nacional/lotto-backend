import z from 'zod';
import { groupPermissionSchema } from '../@types/group-permission.t';

export const createGroupSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  users_id: z.array(z.string()),
  permissions: z.array(groupPermissionSchema),
});

export type CreateGroupDTO = z.infer<typeof createGroupSchema>;
