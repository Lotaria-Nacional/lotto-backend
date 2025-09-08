import { licenceStatusSchema } from '@lotaria-nacional/lotto';
import z from 'zod';

export const licenceBulkSchema = z.object({
  number: z.string(),
  description: z.string().optional(),
  reference: z.string(),
  limit: z.number().optional().default(1),
  status: licenceStatusSchema.optional().default('free'),
  emitted_at: z.coerce.date(), // receber como string ISO ou dd/mm/yyyy
  expires_at: z.coerce.date(),
  file: z.string().optional(),
  coordinates: z.string().optional(),
  admin_id: z.number().optional(),
});

export type LicenceBulk = z.infer<typeof licenceBulkSchema>;
