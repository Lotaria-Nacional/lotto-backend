import z from 'zod';
import { posSchema } from '../../pos/@types/pos.t';

export const licenceStatus = z.enum(['free', 'used']);

export const licence = z.object({
  id: z.uuid(),
  number: z.string(),
  description: z.string(),
  reference: z.string(),
  admin_id: z.number(),
  status: licenceStatus,
  limit: z.number().int().default(1),
  pos: z.array(posSchema),

  file: z.string().optional(),
  coordinates: z.string().optional(),

  emitted_at: z.date(),
  expires_at: z.date(),
  created_at: z.date().optional(),

  //TODO: implement administration and POS schemas
  //   admin    Administration
});

export type Licence = z.infer<typeof licence>;
export type LicenceStatus = z.infer<typeof licenceStatus>;
