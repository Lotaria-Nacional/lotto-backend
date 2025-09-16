import z from 'zod';

export const importPosSchema = z.object({});

export type ImportPosType = z.infer<typeof importPosSchema>;
