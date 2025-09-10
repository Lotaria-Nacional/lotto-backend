import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { idSchema } from '../../../schemas/common/id.schema';
import { markTerminalAsFixedService } from '../services/mark-terminal-as-fixed.service';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function markTerminalAsFixedController(req: Request, res: Response) {
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

  await markTerminalAsFixedService(id, user);

  return res.status(HttpStatus.OK).json({
    message: 'O terminal foi concertado',
  });
}
