import { PosStatus } from '@lotaria-nacional/lotto';
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
    .transform((val) => val?.trim().toUpperCase() || null),
  zone: z
    .string()
    .optional()
    .transform((val) => Number(val) || null),
  type_name: z
    .string()
    .optional()
    .transform((val) => val?.trim().toLowerCase() || null),
  admin_name: z
    .string()
    .optional()
    .transform((val) => val?.trim().toLowerCase() || null),
  status: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return 'pending';
      const map: Record<string, string> = {
        activo: 'active',
        pendente: 'pending',
        negado: 'denied',
        descontinuado: 'discontinued',
        aprovado: 'approved',
      };
      return map[val.trim().toLowerCase()] || 'pending';
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
