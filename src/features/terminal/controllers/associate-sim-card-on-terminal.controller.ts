import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { idSchema } from '../../../schemas/common/id.schema';
import { hasPermission } from '../../../middleware/auth/permissions';
import { AuthPayload, updateTerminalSchema } from '@lotaria-nacional/lotto';
import { associateSimCardOnTerminalService } from '../services/associate-sim-card-on-terminal.service';

export async function associateSimCardOnTerminalController(req: Request, res: Response) {
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

  await associateSimCardOnTerminalService({ ...body, id, user });

  return res.status(HttpStatus.OK).json({
    message: 'Operação bem sucedida',
  });
}
