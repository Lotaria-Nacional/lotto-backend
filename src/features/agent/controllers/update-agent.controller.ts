import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '../../../@types/auth-payload';
import { idSchema } from '../../../schemas/common/id.schema';
import { updateAgentSchema } from '../schemas/update-agent.schema';
import { hasPermission } from '../../../middleware/auth/permissions';
import { updateAgentService } from '../services/update-agent.service';

export async function updateAgentController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  // await hasPermission({
  //   userId: user.id,
  //   res,
  //   permission: {
  //     action: 'UPDATE',
  //     subject: 'Agents',
  //   },
  // });

  const { id } = idSchema.parse(req.params);
  const body = updateAgentSchema.parse({ ...req.body, id, user });

  await updateAgentService(body);

  return res.status(HttpStatus.OK).json({
    message: 'Agente atualizado com sucesso',
  });
}
