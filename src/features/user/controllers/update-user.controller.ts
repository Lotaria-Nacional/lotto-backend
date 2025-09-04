import type { Request, Response } from 'express';
import { AuthPayload } from '../../../@types/auth-payload';
import { idSchema } from '../../../schemas/common/id.schema';
import { updateUserSchema } from '../schemas/update-user.schema';
import { updateUserService } from '../services';

export async function updateUserController(req: Request, res: Response) {
  const user = req.user as AuthPayload;
  const { id } = idSchema.parse(req.params);

  const body = updateUserSchema.parse({ ...req.body, id, user });

  const response = await updateUserService(body);

  return res.status(200).json({
    message: 'Os dados do usuário foram atualizados com sucesso.',
    data: response,
  });
}
