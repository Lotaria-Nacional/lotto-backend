import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '../../../@types/auth-payload';
import { createAgentService } from '../services/create-agent.service';
import { createAgentSchema } from '@lotaria-nacional/lotto';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function createAgentController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'CREATE',
      subject: 'TRAINING',
    },
  });

  const body = createAgentSchema.parse(req.body);

  const { id } = await createAgentService({ ...body, user });

  return res.status(HttpStatus.CREATED).json({
    message: 'Agente criado com sucesso',
    id,
  });
}
