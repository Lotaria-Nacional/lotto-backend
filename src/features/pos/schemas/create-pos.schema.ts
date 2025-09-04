import z from 'zod';
import { currentUserSchema } from '../../../@types/user';

export const createPosSchema = z.object({
  province_id: z.coerce.number(),
  city_id: z.coerce.number(),
  admin_id: z.coerce.number(),
  coordinates: z.string().min(1, 'As coordenadas são obrigatórias').trim(),

  agent_id: z.uuid().optional(),
  id_reference: z.number().int().optional(),
  licence_id: z.uuid().optional(),

  type_id: z.coerce.number().optional(),
  subtype_id: z.coerce.number().optional(),

  area_id: z.coerce.number().optional(),
  zone_id: z.coerce.number().optional(),

  //TODO: add image field and mark as required

  user: currentUserSchema,
});

export type CreatePosDTO = z.infer<typeof createPosSchema>;
