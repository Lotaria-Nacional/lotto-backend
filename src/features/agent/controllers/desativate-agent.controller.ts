import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { idSchema } from '../../../schemas/common/id.schema';
import { desativateAgentService } from '../services/desativate-agent.service';

export async function desativateAgentController(req: Request, res: Response) {
  // const user = req.user as AuthPayload;

  const { id } = idSchema.parse(req.params);

  await desativateAgentService(id);

  return res.status(HttpStatus.OK).json({
    message: 'Agente marcado como inativo',
  });
}
