import z from 'zod';
import { simCardSchema } from '../@types/sim-card.t';

export const fetchSimCardResponseSchema = z.object({
  simCards: z.array(simCardSchema),
});

export type FetchSimCardsResponse = z.infer<typeof fetchSimCardResponseSchema>;
