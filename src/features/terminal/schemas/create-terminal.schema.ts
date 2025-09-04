import z from 'zod';
import { currentUserSchema } from '../../../@types/user';

export const createTerminalSchema = z.object({
  device_id: z.string('O device id é obrigatório').min(1, 'O device id é obrigatório'),
  serial: z.string('O nº de série é obrigatório').min(1, 'O nº de série é obrigatório'),
  arrived_at: z.coerce.date('A data de entrada é obrigatória'),
  user: currentUserSchema,
});

export type CreateTerminalDTO = z.infer<typeof createTerminalSchema>;
