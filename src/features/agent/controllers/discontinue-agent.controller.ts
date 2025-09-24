import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { idSchema } from '../../../schemas/common/id.schema';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { hasPermission } from '../../../middleware/auth/permissions';
import { discontinueAgentService } from '../services/discontinue-agent-service';

export async function discontinueAgentController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'DISCONTINUE',
      subject: 'AGENT',
    },
  });

  const { id } = idSchema.parse(req.params);

  await discontinueAgentService(id, user);

  return res.status(HttpStatus.OK).json({
    message: 'O agente foi descontinuado',
  });
}
