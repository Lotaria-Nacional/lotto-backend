import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { hasPermission } from '../../../middleware/auth/permissions';
import { approveManyPosService } from '../services/approve-many-pos-service';
import { manyIdsSchema } from '../../agent/controllers/approve-many-agents.controller';

export async function approveManyPosController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'APPROVE',
      subject: 'POS',
    },
  });

  const { ids } = manyIdsSchema.parse(req.body);

  await approveManyPosService(ids, user);

  return res.status(HttpStatus.OK).json({
    message: 'Os POS foram aprovados',
  });
}
