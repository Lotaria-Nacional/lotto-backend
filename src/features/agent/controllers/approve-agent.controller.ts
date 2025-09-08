import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '../../../@types/auth-payload';
import { idSchema } from '../../../schemas/common/id.schema';
import { approveAgentService } from '../services/approve-agent.service';

export async function approveAgentController(req: Request, res: Response) {
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

  await approveAgentService(id);

  return res.status(HttpStatus.OK).json({
    message: 'O agente foi aprovado ',
  });
}
