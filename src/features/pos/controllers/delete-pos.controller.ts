import { deletePosService } from '../services';
import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '../../../@types/auth-payload';
import { idSchema } from '../../../schemas/common/id.schema';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function deletePosController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'DELETE',
      subject: 'POS',
    },
  });

  const { id } = idSchema.parse(req.params);

  await deletePosService(id, user);

  return res.status(HttpStatus.OK).json({
    message: 'O POS foi removido',
  });
}
