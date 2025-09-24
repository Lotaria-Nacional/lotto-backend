import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '../../../@types/auth-payload';
import { idSchema } from '../../../schemas/common/id.schema';
import { hasPermission } from '../../../middleware/auth/permissions';
import { reactivateAgentService } from '../services/reactivate-agent-service';

export async function reactivateAgentController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'ACTIVATE',
      subject: 'AGENT',
    },
  });

  const { id } = idSchema.parse(req.params);

  await reactivateAgentService(id, user);

  return res.status(HttpStatus.OK).json({
    message: 'O agente foi aprovado ',
  });
}
