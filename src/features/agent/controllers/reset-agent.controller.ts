import { resetAgentService } from '../services';
import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '../../../@types/auth-payload';
import { idSchema } from '../../../schemas/common/id.schema';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function resetAgentController(req: Request, res: Response) {
  // const user = req.user as AuthPayload;

  const { id } = idSchema.parse(req.params);

  await resetAgentService(id);

  return res.status(HttpStatus.OK).json({
    message: 'Agente resetado com sucesso',
  });
}
