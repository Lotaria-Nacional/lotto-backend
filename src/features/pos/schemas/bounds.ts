import z from 'zod';

export const boundedBoxSchema = z.object({
  minLat: z.string(),
  maxLat: z.string(),
  minLng: z.string(),
  maxLng: z.string(),
});

export type BoundedBoxSchemaDTO = z.infer<typeof boundedBoxSchema>;
