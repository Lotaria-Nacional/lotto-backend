import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { hasPermission } from '../../../middleware/auth/permissions';
import { manyIdsSchema } from '../../agent/controllers/approve-many-agents.controller';
import { resetManyPosService } from '../services/reset-many-pos-service';

export async function resetManyPosController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'RESET',
      subject: 'POS',
    },
  });

  const { ids } = manyIdsSchema.parse(req.body);

  await resetManyPosService(ids, user);

  return res.status(HttpStatus.OK).json({
    message: 'Os POS foram resetados',
  });
}
