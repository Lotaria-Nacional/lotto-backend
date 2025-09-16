import z from 'zod';

export const paramsSchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(50),
  query: z.string().trim().optional().default(''),
  status: z.string().trim().optional().default(''),
  type_name: z.string().optional(),
  subtype_name: z.string().optional(),
  city_name: z.string().optional(),
  area_name: z.string().optional(),
  admin_name: z.string().optional(),
  zone_number: z.coerce.number().optional(),
  province_name: z.string().optional(),
  agent_id_reference: z.coerce.number().optional(),
  delivery_date: z.string().optional(),
  emitted_at: z.string().optional(),
  expires_at: z.string().optional(),
  training_date: z.string().optional(),
  coordinates: z.string().optional(),
});

export type PaginationParams = z.infer<typeof paramsSchema>;
