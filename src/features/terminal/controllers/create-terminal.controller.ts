import type { Request, Response } from 'express';
import { createTerminalService } from '../services';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '../../../@types/auth-payload';
import { createTerminalSchema } from '@lotaria-nacional/lotto';

export async function createTerminalController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  const body = createTerminalSchema.parse(req.body);

  const response = await createTerminalService({ ...body, user });

  return res.status(HttpStatus.CREATED).json({
    message: 'Terminal criado com sucesso',
    id: response.id,
  });
}
