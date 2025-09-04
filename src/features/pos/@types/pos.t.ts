import z from 'zod';

export const posStatus = z.enum(['pending', 'approved', 'active', 'denied']);

export const posSchema = z.object({
  id: z.uuid(),
  coordinates: z.string(),
  status: posStatus,
  created_at: z.date(),

  agent: z.any(),
  admin: z.any(),
  licence: z.any(),
  area: z.any(),
  city: z.any(),
  type: z.any(),
  zone: z.any(),
  subtype: z.any(),
  province: z.any(),
});

export type Pos = z.infer<typeof posSchema>;
export type posStatus = z.infer<typeof posStatus>;
