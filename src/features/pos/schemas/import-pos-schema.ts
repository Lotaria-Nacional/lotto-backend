import z from 'zod';

export const importPosSchema = z.object({
  idRevendedor: z.preprocess(val => {
    if (val === '' || val === null || val === undefined) return undefined;
    return Number(val);
  }, z.number().int().optional()),

  provincia: z.preprocess(val => {
    if (val === '' || val === null || val === undefined) return undefined;
    return String(val).trim().toLowerCase();
  }, z.string().optional()),

  administracao: z.preprocess(val => {
    if (val === '' || val === null || val === undefined) return undefined;
    return String(val).trim().toLowerCase();
  }, z.string().optional()),

  cidade: z.preprocess(val => {
    if (val === '' || val === null || val === undefined) return undefined;
    return String(val).trim().toLowerCase();
  }, z.string().optional()),

  area: z.preprocess(val => {
    if (val === '' || val === null || val === undefined) return undefined;
    const normalized = String(val).trim().toUpperCase();
    const match = normalized.match(/(?:AREA\s*)?([A-Z])/);
    return match ? match[1] : undefined;
  }, z.string().optional()),

  zona: z.preprocess(val => {
    if (val === '' || val === null || val === undefined) return undefined;
    const normalized = String(val).trim().toUpperCase();
    const match = normalized.match(/(?:ZONA\s*)?(\d+)/);
    return match ? parseInt(match[1], 10) : undefined;
  }, z.number().optional()),

  estado: z.preprocess(val => {
    if (val === '' || val === null || val === undefined) return undefined;
    return String(val);
  }, z.string().optional()),

  tipologia: z.preprocess(val => {
    if (val === '' || val === null || val === undefined) return undefined;
    return String(val).trim().toLowerCase();
  }, z.string().optional()),

  licenca: z.preprocess(val => {
    if (val === '' || val === null || val === undefined) return undefined;
    return String(val);
  }, z.string().optional()),

  coordenadas: z.string().optional(),
});

export type ImportPosDTO = z.infer<typeof importPosSchema>;
