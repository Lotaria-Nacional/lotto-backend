import { simCardStatusSchema } from '@lotaria-nacional/lotto';
import { z } from 'zod';

export const simCardBulkSchema = z.object({
  number: z.string().nonempty('Número do SIM é obrigatório'),
  pin: z.string().optional(),
  puk: z.string().optional(),
  status: simCardStatusSchema.optional().default('stock'),
  arrived_at: z
    .string()
    .optional()
    .transform(val => (val ? new Date(val) : new Date())),
});
