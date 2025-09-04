import z from 'zod';

export const loginSchema = z.object({
  email: z
    .email('O email é obrigatório.')
    .refine((val) => val.includes('@lotarianacional.co.ao'), { error: 'O email deve pertencer à Lotaria Nacional' })
    .min(2, 'O email é obrigatório.'),
  password: z
    .string('O palavra-passe é obrigatória.')
    .min(6, 'A palavra-passe deve ter no mínimo 6 dígitos/caractéres'),
});

export type loginDTO = z.infer<typeof loginSchema>;
