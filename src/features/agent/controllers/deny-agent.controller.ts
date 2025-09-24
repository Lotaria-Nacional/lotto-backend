import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { idSchema } from '../../../schemas/common/id.schema';
import { reproveAgentService } from '../services/reprove-agent-service';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function denyAgentController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'REPROVE',
      subject: 'AGENT',
    },
  });

  const { id } = idSchema.parse(req.params);

  await reproveAgentService(id, user);

  return res.status(HttpStatus.OK).json({
    message: 'O agente foi reprovado ',
  });
}
