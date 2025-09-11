import { Request, Response } from 'express';
import { AuthPayload } from '../../../@types/auth-payload';
import { HttpStatus } from '../../../constants/http';
import { paramsSchema } from '../../../schemas/common/query.schema';
import { fetchAgentsService } from '../services/fetch-agents.service';
import { hasPermission } from '../../../middleware/auth/permissions';
import { AgentStatus } from '@lotaria-nacional/lotto';

export async function fetchAgentsController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  const query = paramsSchema.parse(req.query);

  if (query.status && (query.status as AgentStatus) === 'scheduled') {
    await hasPermission({
      res,
      userId: user.id,
      permission: {
        action: 'READ',
        subject: 'TRAINING',
      },
    });
  }

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'READ',
      subject: 'AGENT',
    },
  });

  const response = await fetchAgentsService(query);

  return res.status(HttpStatus.OK).json(response);
}
