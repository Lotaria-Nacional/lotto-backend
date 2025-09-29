import type { Response, Request } from 'express';
import { HttpStatus } from '../../../constants/http';
import { idSchema } from '../../../schemas/common/id.schema';
import { hasPermission } from '../../../middleware/auth/permissions';
import { AuthPayload, updateAgentSchema } from '@lotaria-nacional/lotto';
import { activateAgentService } from '../services/activate-agent-service';

export async function activateAgentController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'ACTIVATE',
      subject: 'AGENT',
    },
  });

  const { id } = idSchema.parse(req.params);

  const body = updateAgentSchema.parse({ ...req.body, id });

  await activateAgentService({ ...body, user });

  return res.status(HttpStatus.OK).json({ message: 'Agente ativado' });
}
