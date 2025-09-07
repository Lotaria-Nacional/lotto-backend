import { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { createSimCardService } from '../services';
import { AuthPayload } from '../../../@types/auth-payload';
import { createSimCardSchema } from '@lotaria-nacional/lotto';

export async function createSimCardController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  const body = createSimCardSchema.parse(req.body);

  const { id } = await createSimCardService({ ...body, user });

  return res.status(HttpStatus.CREATED).json({ id });
}
