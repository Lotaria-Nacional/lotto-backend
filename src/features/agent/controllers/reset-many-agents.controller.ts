import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { manyIdsSchema } from './approve-many-agents.controller';
import { hasPermission } from '../../../middleware/auth/permissions';
import { resetManyAgentsService } from '../services/reset-many-agents-service';

export async function resetManyAgentsController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'RESET',
      subject: 'AGENT',
    },
  });

  const { ids } = manyIdsSchema.parse(req.body);

  await resetManyAgentsService(ids, user);

  return res.status(HttpStatus.OK).json({
    message: 'Os agentes foram resetados com sucesso',
  });
}
