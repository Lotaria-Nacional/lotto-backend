import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '../../../@types/auth-payload';
import { idSchema } from '../../../schemas/common/id.schema';
import { hasPermission } from '../../../middleware/auth/permissions';
import { deleteAgentService } from '../services/delete-agent.service';

export async function deleteAgentController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  // await hasPermission({
  //   userId: user.id,
  //   res,
  //   permission: {
  //     action: 'DELETE',
  //     subject: 'Agents',
  //   },
  // });

  const { id } = idSchema.parse(req.params);
  await deleteAgentService(id, user);

  return res.status(HttpStatus.OK).json({
    message: 'Agente removido com sucesso',
  });
}
