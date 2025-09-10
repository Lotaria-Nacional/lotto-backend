import z from 'zod';

export const paramsSchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20),
  query: z.string().trim().optional().default(''),
  status: z.string().trim().optional().default(''),
  type_id: z.coerce.number().optional(),
  subtype_id: z.coerce.number().optional(),
  city_id: z.coerce.number().optional(),
  area_id: z.coerce.number().optional(),
  admin_id: z.coerce.number().optional(),
  zone_id: z.coerce.number().optional(),
  province_id: z.coerce.number().optional(),
  agent_id: z.string().optional(),
  delivery_date: z.string().optional(),
  emitted_at: z.string().optional(),
  expires_at: z.string().optional(),
  training_date: z.string().optional(),
  coordinates: z.string().optional(),
});

export type PaginationParams = z.infer<typeof paramsSchema>;
