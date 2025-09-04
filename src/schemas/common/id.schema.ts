import z from 'zod';

export const idSchema = z.object({
  id: z.uuid(),
});

export const idsSchema = z.object({
  ids: z.array(z.uuid()).min(1, 'Nenhum grupo foi fornecido'),
});

// export type PaginationParams = z.infer<typeof paramsSchema>
