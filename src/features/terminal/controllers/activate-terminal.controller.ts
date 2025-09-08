import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { idSchema } from '../../../schemas/common/id.schema';
import { activateTerminalService } from '../services/activate-terminal.service';

export async function activateTerminalController(req: Request, res: Response) {
  const { id } = idSchema.parse(req.params);

  await activateTerminalService(id);

  return res.status(HttpStatus.OK).json({
    message: 'O terminal foi ativado com sucesso',
  });
}
