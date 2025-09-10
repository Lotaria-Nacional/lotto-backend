import { updateUserService } from '../services';
import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '../../../@types/auth-payload';
import { idSchema } from '../../../schemas/common/id.schema';
import { updateUserSchema } from '../schemas/update-user.schema';

export async function updateUserController(req: Request, res: Response) {
  const user = req.user as AuthPayload;
  const { id } = idSchema.parse(req.params);

  const body = updateUserSchema.parse({ ...req.body, id, user });

  const response = await updateUserService(body);

  return res.status(HttpStatus.OK).json({
    message: 'Usuário atualizado',
    data: response,
  });
}
