import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { hasPermission } from '../../../middleware/auth/permissions';
import { fixManyTerminalsService } from '../services/fix-many-terminals-service';
import { manyIdsSchema } from '../../agent/controllers/approve-many-agents.controller';

export async function fixManyTerminalsController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'FIX',
      subject: 'TERMINAL',
    },
  });

  const { ids } = manyIdsSchema.parse(req.body);

  await fixManyTerminalsService(ids, user);

  return res.status(HttpStatus.OK).json({
    message: 'Os terminais foram concertados',
  });
}
