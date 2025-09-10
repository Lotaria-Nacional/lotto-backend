import type { Request, Response } from 'express';
import { deleteTerminalService } from '../services';
import { AuthPayload } from '../../../@types/auth-payload';
import { idSchema } from '../../../schemas/common/id.schema';
import { HttpStatus } from '../../../constants/http';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function deleteTerminalController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'DELETE',
      subject: 'TERMINAL',
    },
  });

  const { id } = idSchema.parse(req.params);

  await deleteTerminalService(id, user);

  return res.status(HttpStatus.OK).json({
    message: 'Terminal removido',
  });
}
