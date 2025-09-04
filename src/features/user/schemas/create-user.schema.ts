import z from 'zod';
import { currentUserSchema } from '../../../@types/user';

export const createUserSchema = z.object({
  first_name: z.string('O nome é obrigatório.').min(2, 'O nome deve ter no mínimo 2 caractéres.'),
  last_name: z.string('O sobrenome é obrigatório.').min(2, 'O sobrenome deve conter no mínimo 2 caractéres.'),
  email: z
    .email('O email é obrigatório.')
    .refine((val) => val.includes('@lotarianacional.co.ao'), { error: 'O email deve pertencer à Lotaria Nacional' })
    .min(2, 'O email é obrigatório.'),
  password: z
    .string('O palavra-passe é obrigatória.')
    .min(6, 'A palavra-passe deve ter no mínimo 6 dígitos/caractéres'),

  reset_password_token: z.string().optional(),
  user: currentUserSchema,
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
