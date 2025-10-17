import z from 'zod';
import { parseImportedDate } from '../../../utils/import-utils';

export const importLicenceSchema = z.object({
  reference: z.string(),
  admin_name: z.string().transform(val => val.toLowerCase().trim()),
  coordinates: z.string().optional(),
  district: z.string().optional(),
  emitted_at: z.transform(parseImportedDate).optional(),
  expires_at: z.transform(parseImportedDate).optional(),
  number: z.string(),
  description: z.string(),
  limit: z.coerce.number().default(50),
});

export type ImportLicenceDTO = z.infer<typeof importLicenceSchema>;
