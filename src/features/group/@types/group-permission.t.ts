import z from 'zod';
import { actionsSchema } from './actions.t';
import { moduleSchema } from './modules.t';

export const groupPermissionSchema = z.object({
  module: moduleSchema,
  actions: z.array(actionsSchema),
});

export type GroupPermission = z.infer<typeof groupPermissionSchema>;
