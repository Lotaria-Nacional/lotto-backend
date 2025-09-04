import z from 'zod';
import { terminalSchema } from '../@types/terminal.t';

const fetchTerminalsResponseSchema = z.object({
  terminals: z.array(terminalSchema),
});

export type FetchTerminalsResponse = z.infer<typeof fetchTerminalsResponseSchema>;
