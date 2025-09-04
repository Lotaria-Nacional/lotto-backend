import z from 'zod';

export const actionsSchema = z.enum(['READ', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT']);
export type Action = z.infer<typeof actionsSchema>;
