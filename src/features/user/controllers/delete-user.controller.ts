import { deleteUserService } from '../services';
import type { Request, Response } from 'express';
import { AuthPayload } from '../../../@types/auth-payload';
import { idSchema } from '../../../schemas/common/id.schema';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function deleteUserController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'DELETE',
      subject: 'USER',
    },
  });

  const { id } = idSchema.parse(req.params);

  await deleteUserService(id, user);

  return res.status(200).json({
    message: 'Usuário removido',
  });
}
