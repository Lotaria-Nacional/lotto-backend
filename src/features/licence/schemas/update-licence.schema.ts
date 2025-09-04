import z from 'zod';
import { createLicenceSchema } from './create-licence.schema';

export const updateLicenceSchema = createLicenceSchema
  .partial()
  .extend({
    id: z.uuid(),
  })
  .required({
    user: true,
  });

export type UpdateLicenceDTO = z.infer<typeof updateLicenceSchema>;
