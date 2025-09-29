import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { hasPermission } from '../../../middleware/auth/permissions';
import { manyIdsSchema } from '../../agent/controllers/approve-many-agents.controller';
import { denyManyPosService } from '../services/deny-many-pos-service';

export async function denyManyPosController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'DENY',
      subject: 'POS',
    },
  });

  const { ids } = manyIdsSchema.parse(req.body);

  await denyManyPosService(ids, user);

  return res.status(HttpStatus.OK).json({
    message: 'Os POS foram negados',
  });
}
