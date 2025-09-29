import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { hasPermission } from '../../../middleware/auth/permissions';
import { manyIdsSchema } from './approve-many-agents.controller';
import { discontinueManyAgentsService } from '../services/discontinue-many-agents-service';

export async function discontinueManyAgentsController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'DISCONTINUE',
      subject: 'AGENT',
    },
  });

  const { ids } = manyIdsSchema.parse(req.body);

  await discontinueManyAgentsService(ids, user);

  return res.status(HttpStatus.OK).json({
    message: 'Os agentes foram descontinuados',
  });
}
