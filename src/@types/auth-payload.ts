import z from 'zod';

export const authPayloadSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
});
export interface AuthPayload {
  id: string;
  email: string;
  name: string;
}
