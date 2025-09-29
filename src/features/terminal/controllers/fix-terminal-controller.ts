import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { idSchema } from '../../../schemas/common/id.schema';
import { fixTerminalService } from '../services/fix-terminal-service';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function fixTerminalController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'FIX',
      subject: 'TERMINAL',
    },
  });

  const { id } = idSchema.parse(req.params);

  await fixTerminalService(id, user);

  return res.status(HttpStatus.OK).json({
    message: 'O terminal foi concertado',
  });
}
