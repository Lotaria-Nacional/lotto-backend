import z from 'zod';
import { Terminal, terminalSchema } from '../../terminal/@types/terminal.t';

export const simCardSchema = z.object({
  id: z.string(),
  number: z.number(),
  pin: z.number().nullable(),
  puk: z.number().nullable(),
  created_at: z.date(),
});

export type SimCard = z.infer<typeof simCardSchema> & { terminal: Terminal };
