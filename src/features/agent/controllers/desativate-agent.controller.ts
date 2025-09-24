import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { idSchema } from '../../../schemas/common/id.schema';
import { desativateAgentService } from '../services/desativate-agent-service';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function desativateAgentController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'BLOCK',
      subject: 'AGENT',
    },
  });

  const { id } = idSchema.parse(req.params);

  await desativateAgentService(id, user);

  return res.status(HttpStatus.OK).json({
    message: 'Agente marcado como inativo',
  });
}
