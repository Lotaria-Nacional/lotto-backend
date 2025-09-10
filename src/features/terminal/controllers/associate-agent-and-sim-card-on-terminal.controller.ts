import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { idSchema } from '../../../schemas/common/id.schema';
import { hasPermission } from '../../../middleware/auth/permissions';
import { AuthPayload, updateTerminalSchema } from '@lotaria-nacional/lotto';
import { associateAgentAndSimCardOnTerminalService } from '../services/associate-agent-and-sim-card-on-terminal.service';

export async function associateAgentAndSimCardOnTerminalController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'ASSOCIATE',
      subject: 'TERMINAL',
    },
  });

  const { id } = idSchema.parse(req.params);

  const body = updateTerminalSchema.parse(req.body);

  await associateAgentAndSimCardOnTerminalService({ ...body, id, user });

  return res.status(HttpStatus.OK).json({
    message: 'Operação bem sucedida',
  });
}
