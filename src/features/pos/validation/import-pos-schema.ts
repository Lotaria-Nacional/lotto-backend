import { PosStatus } from '@lotaria-nacional/lotto';
import z from 'zod';

export const importPosSchema = z.object({
  agent_id_reference: z
    .string()
    .optional()
    .transform(val => {
      if (!val) return null;
      // remover tudo que não seja dígito
      const cleaned = val.replace(/\D/g, '');
      if (!cleaned) return null; // se não sobrar nada, retorna null
      return Number(cleaned);
    })
    .refine(val => val === null || !isNaN(val), { message: 'agent_id_reference inválido' }),

  // Campos obrigatórios transformados para aceitar valores “inválidos”
  province: z
    .string()
    .optional()
    .transform(val => val?.trim().toLowerCase().normalize('NFC')),

  city: z
    .string()
    .optional()
    .transform(val => {
      if (!val) return null;
      const cleaned = val.trim().toLowerCase().normalize('NFC');
      // Ignorar valores que sabemos não existirem
      if (['n/d', 'agencias', 'agençias'].includes(cleaned)) return null;
      return cleaned;
    }),

  area: z
    .string()
    .optional()
    .transform(val => {
      if (!val) return null; // vazio -> null
      const cleaned = val
        .replace(/^area\s*/i, '')
        .trim()
        .toUpperCase();
      if (['', 'AGENCIAS'].includes(cleaned)) return null;
      return cleaned;
    }),

  zone: z
    .string()
    .optional()
    .transform(val => {
      if (!val) return null;
      const zone = Number(val.replace(/^zona\s*/i, '').trim());
      return isNaN(zone) ? null : zone;
    }),

  type_name: z
    .string()
    .optional()
    .transform(val => {
      if (!val) return null;
      const regex = /^agencia\s*(.*)$/i;
      const match = val.match(regex);
      if (match && match[1].trim() !== '') return match[1].trim().toLowerCase();
      const cleaned = val.trim().toLowerCase();
      if (cleaned === 'agencia' || cleaned === '') return null;
      return cleaned;
    }),

  // Campos opcionais
  admin_name: z
    .string()
    .optional()
    .transform(val => val?.trim().toLowerCase()),
  status: z.string().optional().transform(checkPosStatus),
  licence: z.string().optional(),
  coordinates: z.string().optional(),
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
