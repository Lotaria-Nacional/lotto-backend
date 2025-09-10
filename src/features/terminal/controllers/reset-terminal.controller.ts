import type { Request, Response } from 'express';
import { resetTerminalService } from '../services';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { idSchema } from '../../../schemas/common/id.schema';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function resetTerminalController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'RESET',
      subject: 'TERMINAL',
    },
  });

  const { id } = idSchema.parse(req.params);

  await resetTerminalService(id, user);

  return res.status(HttpStatus.OK).json({
    message: 'O terminal foi resetado',
  });
}
