import { PosStatus, posStatusSchema } from '@lotaria-nacional/lotto';
import z from 'zod';

export const importPosSchema = z.object({
  agent_id_reference: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val.replace(/\D/g, '')) || null : null)),

  province: z
    .string()
    .optional()
    .transform((val) => val?.trim() || null),
  city: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return null;
      const cleaned = val.trim().toLowerCase();
      return ['n/d', 'agencias', 'agençias'].includes(cleaned) ? null : cleaned;
    }),
  area: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return null;
      const match = val.match(/AREA\s*(\w+)/i); // captura qualquer letra/número depois de "AREA"
      return match ? match[1].toUpperCase() : null;
    }),
  zone: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return null;
      const match = val.match(/ZONA\s*(\d+)/i); // captura apenas números depois de "ZONA"
      return match ? Number(match[1].toLowerCase()) : null;
    }),
  type_name: z
    .string()
    .optional()
    .transform((val) => {
      const regex = /AG[EÊ]NCIAS?\s*(.+)$/iu;

      if (val && regex.test(val)) {
        const match = val?.match(regex);
        return match ? match[1].toLowerCase() : null;
      }

      const v = val?.trim().toLowerCase() || null;
      return v;
    }),
  admin_name: z
    .string()
    .optional()
    .transform((val) => val?.trim().toLowerCase() || null),
  status: z
    .string()
    .optional()
    .transform((val) => {
      const v = val?.toLowerCase();
      if (!v) return 'pending';
      const map: Record<string, string> = {
        activo: 'active',
        pendente: 'pending',
        negado: 'denied',
        descontinuado: 'discontinued',
        aprovado: 'approved',
      };
      return map[v.trim()] || 'pending';
    }),
  licence: z
    .string()
    .optional()
    .transform((val) => val || null),
  coordinates: z
    .string()
    .optional()
    .transform((val) => val || null),
});

export type ImportPosDTO = z.infer<typeof importPosSchema>;

function checkPosStatus(val: string | undefined): PosStatus | undefined {
  if (!val) return undefined;
  switch (val.trim().toLowerCase()) {
    case 'activo':
      return 'active';
    case 'pendente':
      return 'pending';
    case 'negado':
      return 'denied';
    case 'descontinuado':
      return 'discontinued';
    case 'aprovado':
      return 'approved';
    default:
      return 'pending';
  }
}
