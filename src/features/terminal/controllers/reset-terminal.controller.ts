import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '../../../@types/auth-payload';
import { idSchema } from '../../../schemas/common/id.schema';
import { resetTerminalService } from '../services';

export async function resetTerminalController(req: Request, res: Response) {
  // const user = req.user as AuthPayload;

  const { id } = idSchema.parse(req.params);

  await resetTerminalService(id);

  return res.status(HttpStatus.OK).json({
    message: 'O terminal foi resetado com sucesso',
  });
}
