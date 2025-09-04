import z from 'zod';

export const userRoleSchema = z.enum(['dev', 'user', 'admin', 'supervisor', 'area_manager']);
export const userSchema = z.object({
  id: z.uuid(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.email(),
  role: userRoleSchema,
});

export type User = z.infer<typeof userSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
