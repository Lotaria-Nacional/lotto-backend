import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { idSchema } from '../../../schemas/common/id.schema';
import { hasPermission } from '../../../middleware/auth/permissions';
import { AuthPayload, updateTerminalSchema } from '@lotaria-nacional/lotto';
import { reportTerminalMalFunctionService } from '../services/report-terminal-mal-function-service';

export async function reporTerminalMalFunctionController(req: Request, res: Response) {
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

  await reportTerminalMalFunctionService(body, user);

  return res.status(HttpStatus.OK).json({
    message: 'Avaria reportada',
  });
}
