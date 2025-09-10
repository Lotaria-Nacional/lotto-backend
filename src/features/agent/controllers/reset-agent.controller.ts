import { resetAgentService } from '../services';
import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { idSchema } from '../../../schemas/common/id.schema';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function resetAgentController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'RESET',
      subject: 'AGENT',
    },
  });

  const { id } = idSchema.parse(req.params);

  await resetAgentService(id, user);

  return res.status(HttpStatus.OK).json({
    message: 'Agente resetado',
  });
}
