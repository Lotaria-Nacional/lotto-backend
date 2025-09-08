import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { idSchema } from '../../../schemas/common/id.schema';
import { associateAgentAndSimCardOnTerminalService } from '../services/associate-agent-and-sim-card-on-terminal.service';
import { updateTerminalSchema } from '@lotaria-nacional/lotto';

export async function associateAgentAndSimCardOnTerminalController(req: Request, res: Response) {
  const { id } = idSchema.parse(req.params);
  const body = updateTerminalSchema.parse(req.body);
  await associateAgentAndSimCardOnTerminalService({ ...body, id });

  return res.status(HttpStatus.OK).json({
    message: 'Operação bem sucedida',
  });
}
