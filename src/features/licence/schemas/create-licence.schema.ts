import z from 'zod';
import { currentUserSchema } from '../../../@types/user';

export const createLicenceSchema = z.object({
  number: z.string('O número da licença é obrigatório').trim(),
  description: z.string('A descrição da licença é obrigatória').trim(),
  admin_id: z.coerce.number('A administração é obrigatória'),

  emitted_at: z.coerce.date('A data de emissão é obrigatória'),
  expires_at: z.coerce.date('A data de expiração é obrigatória'),

  file: z.string().optional(),
  limit: z.coerce.number().optional(),

  user: currentUserSchema,
});

export type CreateLicenceDTO = z.infer<typeof createLicenceSchema>;
