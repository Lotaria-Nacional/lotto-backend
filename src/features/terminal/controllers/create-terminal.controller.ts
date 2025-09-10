import type { Request, Response } from 'express';
import { createTerminalService } from '../services';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '../../../@types/auth-payload';
import { createTerminalSchema } from '@lotaria-nacional/lotto';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function createTerminalController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'CREATE',
      subject: 'TERMINAL',
    },
  });

  const body = createTerminalSchema.parse(req.body);

  const response = await createTerminalService({ ...body, user });

  return res.status(HttpStatus.CREATED).json({
    message: 'Terminal criado com sucesso',
    id: response.id,
  });
}
