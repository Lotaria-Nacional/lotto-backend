import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { hasPermission } from '../../../middleware/auth/permissions';
import { manyIdsSchema } from '../../agent/controllers/approve-many-agents.controller';
import { reactivateManyPosService } from '../services/re-activate-many-pos-service';

export async function reactivateManyPosController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'REACTIVATE',
      subject: 'POS',
    },
  });

  const { ids } = manyIdsSchema.parse(req.body);

  await reactivateManyPosService(ids, user);

  return res.status(HttpStatus.OK).json({
    message: 'Os POS foram reativados',
  });
}
