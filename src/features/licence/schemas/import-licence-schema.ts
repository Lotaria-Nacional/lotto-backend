import z from 'zod';
import { parseDate } from '../../../utils/date';

export const importLicenceSchema = z.object({
  reference: z.string(),
  admin_name: z.preprocess(val => {
    if (val === '' || val === null || val === undefined) return undefined;
    return String(val).trim().toLowerCase();
  }, z.string().optional()),
  coordinates: z.string().optional(),
  district: z.string().optional(),
  emitted_at: z.string().optional().transform(parseDate),
  expires_at: z.string().optional().transform(parseDate),
  number: z.string(),
  description: z.string(),
  limit: z.preprocess(val => {
    if (val === '' || val === null || val === undefined) return 10;
    const num = Number(val);
    return isNaN(num) ? 10 : num;
  }, z.number().int().default(10)),
});

export type ImportLicenceDTO = z.infer<typeof importLicenceSchema>;
