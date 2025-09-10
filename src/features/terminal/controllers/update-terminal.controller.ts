import type { Request, Response } from 'express';
import { updateTerminalService } from '../services';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '../../../@types/auth-payload';
import { idSchema } from '../../../schemas/common/id.schema';
import { updateTerminalSchema } from '@lotaria-nacional/lotto';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function updateTerminalController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'UPDATE',
      subject: 'TERMINAL',
    },
  });

  const { id } = idSchema.parse(req.params);

  const body = updateTerminalSchema.parse({ ...req.body, id });

  await updateTerminalService({ ...body, user });

  return res.status(HttpStatus.OK).json({
    message: 'O terminal foi atualizado',
  });
}
