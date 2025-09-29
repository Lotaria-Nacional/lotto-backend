import z from 'zod';
import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '../../../@types/auth-payload';
import { updateUserPasswordService } from '../services/update-password';

export const updatePasswordSchema = z.object({
  oldPassword: z.string(),
  newPassword: z.string(),
});

export type UpdateUserPasswordDTO = z.infer<typeof updatePasswordSchema>;

export async function updatePasswordController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  // Valida apenas o body
  const body = updatePasswordSchema.parse(req.body);

  const response = await updateUserPasswordService(body, user);

  return res.status(HttpStatus.OK).json({
    message: 'Usuário atualizado',
    data: response,
  });
}
