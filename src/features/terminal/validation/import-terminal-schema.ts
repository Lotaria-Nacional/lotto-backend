import z from 'zod';
import { TerminalStatus } from '@lotaria-nacional/lotto';
import { parseImportedDate } from '../../../utils/import-utils';

export const importTerminalsSchema = z.object({
  agent_id_reference: z
    .string()
    .transform((val) => {
      if (!val) return null;
      const num = Number(val.trim());
      return !isNaN(num) && /^\d+$/.test(val.trim()) ? num : null;
    })
    .nullable()
    .optional(),
  serial_number: z.string().trim().nonempty('O número de série é obrigatório'),
  device_id: z.string().trim().optional(),
  sim_card_number: z.string().trim().optional(),
  pin: z.string().trim().optional(),
  puk: z.string().trim().optional(),
  obs: z.string().optional(),
  status: z
    .string()
    .transform((val): TerminalStatus | undefined => {
      const v = val.toLowerCase().trim();
      switch (v) {
        case 'em campo':
          return 'on_field';
        case 'pronto':
          return 'ready';
        case 'entregue':
          return 'delivered';
        case 'inventário':
          return 'stock';
        case 'avariado':
          return 'broken';
        default:
          return 'ready';
      }
    })
    .optional(),
  chip_serial_number: z.string().trim().optional(),
  activatedAt: z.transform(parseImportedDate).optional(),
});

export type ImportTerminalsDTO = z.infer<typeof importTerminalsSchema>;
