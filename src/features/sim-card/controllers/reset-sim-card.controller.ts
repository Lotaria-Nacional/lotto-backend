import type { Request, Response } from 'express';
import { resetSimCardService } from '../services';
import { HttpStatus } from '../../../constants/http';
import { idSchema } from '../../../schemas/common/id.schema';

export async function resetSimCardController(req: Request, res: Response) {
  const user = req.user;

  const { id } = idSchema.parse(req.params);

  await resetSimCardService(id);

  return res.status(HttpStatus.OK).json({ messsage: 'Sim card resetado com sucesso' });
}
