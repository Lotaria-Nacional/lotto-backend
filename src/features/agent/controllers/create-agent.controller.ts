import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '../../../@types/auth-payload';
import { createAgentService } from '../services/create-agent.service';
import { createAgentSchema } from '../schemas/create-agent.schema';
import { hasPermission } from '../../../middleware/auth/permissions';

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

  const body = createAgentSchema.parse({ ...req.body, user });

  const { id } = await createAgentService(body);

  return res.status(HttpStatus.CREATED).json({
    message: 'Agente criado com sucesso',
    id,
  });
}
