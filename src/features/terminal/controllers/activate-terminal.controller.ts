import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { idSchema } from '../../../schemas/common/id.schema';
import { activateTerminalService } from '../services/activate-terminal.service';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function activateTerminalController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'APPROVE',
      subject: 'TERMINAL',
    },
  });

  const { id } = idSchema.parse(req.params);

  await activateTerminalService(id, user);

  return res.status(HttpStatus.OK).json({
    message: 'O terminal foi ativado',
  });
}
