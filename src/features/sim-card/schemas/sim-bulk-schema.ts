import { simCardStatusSchema } from '@lotaria-nacional/lotto';
import { z } from 'zod';

export const simCardBulkSchema = z.object({
  number: z.coerce.string().nonempty('Número do SIM é obrigatório'),
  pin: z.coerce.string().optional(),
  puk: z.coerce.string().optional(),
  status: simCardStatusSchema.optional().default('stock'),
  arrived_at: z.coerce
    .string()
    .optional()
    .transform(val => (val ? new Date(val) : new Date())),
});
