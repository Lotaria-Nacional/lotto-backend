import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '../../../@types/auth-payload';
import { hasPermission } from '../../../middleware/auth/permissions';
import { manyIdsSchema } from './approve-many-agents.controller';
import { reactivateManyAgentsService } from '../services/reactivate-many-agents-service';

export async function reactivateManyAgentsController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'REACTIVATE',
      subject: 'AGENT',
    },
  });

  const { ids } = manyIdsSchema.parse(req.body);

  await reactivateManyAgentsService(ids, user);

  return res.status(HttpStatus.OK).json({
    message: 'Os agentes foram reativados',
  });
}
