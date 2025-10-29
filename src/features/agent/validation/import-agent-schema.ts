import z from 'zod';

import { AgentStatus } from '@lotaria-nacional/lotto';
import { parseImportedDate } from '../../../utils/import-utils';

export const importAgentsSchema = z.object({
  id_reference: z.coerce.number().int(),
  name: z.string().trim(),
  last_name: z.string().trim(),
  gender: z.string().transform((val) => {
    const v = val.toLowerCase().trim();
    if (/^m(asculino)?$/.test(v)) return 'male';
    if (/^f(eminino)?$/.test(v)) return 'female';
    return 'male';
  }),
  area: z
    .string()
    .transform((val) => {
      const match = val.match(/AREA\s*(\w+)/i);
      return match ? match[1].toUpperCase() : null;
    })
    .optional(),
  zone: z
    .string()
    .transform((val) => {
      const match = val.match(/ZONA\s*(\w+)/i);
      return match ? match[1].toUpperCase() : null;
    })
    .optional(),
  training_date: z.transform(parseImportedDate),
  status: z
    .string()
    .transform((val): AgentStatus | undefined => {
      const v = val.toLowerCase().trim();
      switch (v) {
        case 'activo':
          return 'active';
        case 'negado':
          return 'discontinued';
        case 'apto':
          return 'approved';
        case 'agendado':
          return 'scheduled';
        default:
          return undefined;
      }
    })
    .optional(),
  phone_number: z.string().trim(),
  bi_number: z.string().trim(),
});

export type ImportAgentDTO = z.infer<typeof importAgentsSchema>;
