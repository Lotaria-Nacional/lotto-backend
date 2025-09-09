import type { Request, Response } from 'express';
import { updateSimCardService } from '../services';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '../../../@types/auth-payload';
import { idSchema } from '../../../schemas/common/id.schema';
import { updateSimCardSchema } from '@lotaria-nacional/lotto';

export async function updateSimCardController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  const { id } = idSchema.parse(req.params);
  const body = updateSimCardSchema.parse({ ...req.body, id });

  await updateSimCardService({ ...body, user });

  return res.status(HttpStatus.OK).json({ message: 'Sim card atualizado' });
}
