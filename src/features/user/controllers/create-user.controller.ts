import { createUserService } from '../services';
import type { Request, Response } from 'express';
import { AuthPayload } from '../../../@types/auth-payload';
import { createUserSchema } from '../schemas/create-user.schema';
import { HttpStatus } from '../../../constants/http';

export async function createUserController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  const body = createUserSchema.parse({ ...req.body, user });
  const response = await createUserService(body);

  return res.status(HttpStatus.CREATED).json({
    message: 'Usuário criado',
    data: response,
  });
}
