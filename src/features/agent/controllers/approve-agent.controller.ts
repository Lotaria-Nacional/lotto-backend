import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '../../../@types/auth-payload';
import { idSchema } from '../../../schemas/common/id.schema';
import { hasPermission } from '../../../middleware/auth/permissions';
import { approveAgentService } from '../services/approve-agent-service';

export async function approveAgentController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'APPROVE',
      subject: 'AGENT',
    },
  });

  const { id } = idSchema.parse(req.params);

  await approveAgentService(id, user);

  return res.status(HttpStatus.OK).json({
    message: 'O agente foi aprovado ',
  });
}
