import type { Request, Response } from 'express';
import { AuthPayload } from '../../../@types/auth-payload';
import { HttpStatus } from '../../../constants/http';
import { idSchema } from '../../../schemas/common/id.schema';
import { updateTerminalSchema } from '../schemas/update-terminal.schema';
import { updateTerminalService } from '../services';

export async function updateTerminalController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  const { id } = idSchema.parse(req.params);
  const body = updateTerminalSchema.parse({ ...req.body, id, user });

  await updateTerminalService(body);

  return res.status(HttpStatus.OK).json({
    message: 'O terminal foi atualizado com sucesso',
  });
}
