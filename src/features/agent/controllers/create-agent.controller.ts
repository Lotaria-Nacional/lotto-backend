import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '../../../@types/auth-payload';
import { createAgentService } from '../services/create-agent.service';
import { hasPermission } from '../../../middleware/auth/permissions';
import { createAgentSchema } from '@lotaria-nacional/lotto';

export async function createAgentController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  // await hasPermission({
  //   permission: {
  //     action: 'CREATE',
  //     subject: 'Agents',
  //   },
  //   res,
  //   userId: user.id,
  // });

  const body = createAgentSchema.parse(req.body);

  const { id } = await createAgentService({ ...body, user });

  return res.status(HttpStatus.CREATED).json({
    message: 'Agente criado com sucesso',
    id,
  });
}
