import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { hasPermission } from '../../../middleware/auth/permissions';
import { resetManyTerminalsService } from '../services/reset-many-terminals-service';
import { manyIdsSchema } from '../../agent/controllers/approve-many-agents.controller';

export async function resetManyTerminalsController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'RESET',
      subject: 'TERMINAL',
    },
  });

  const { ids } = manyIdsSchema.parse(req.body);

  await resetManyTerminalsService(ids, user);

  return res.status(HttpStatus.OK).json({
    message: 'Os terminais foram resetados',
  });
}
