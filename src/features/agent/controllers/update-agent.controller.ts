import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload, updateAgentSchema } from '@lotaria-nacional/lotto';
import { idSchema } from '../../../schemas/common/id.schema';
import { updateAgentService } from '../services/update-agent.service';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function updateAgentController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'UPDATE',
      subject: 'TRAINING',
    },
  });

  const { id } = idSchema.parse(req.params);

  const body = updateAgentSchema.parse({ ...req.body, id });

  await updateAgentService({ ...body, user });

  return res.status(HttpStatus.OK).json({
    message: 'Agente atualizado',
  });
}
