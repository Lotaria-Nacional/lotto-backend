import type { Request, Response } from 'express';
import { idSchema } from '../../../schemas/common/id.schema';
import { updateSimCardSchema } from '../schemas/update-sim-card.schema';
import { updateSimCardService } from '../services';
import { HttpStatus } from '../../../constants/http';

export async function updateSimCardController(req: Request, res: Response) {
  const user = req.user;

  const { id } = idSchema.parse(req.params);
  const body = updateSimCardSchema.parse({ ...req.body, id, user });

  const response = await updateSimCardService(body);

  return res.status(HttpStatus.OK).json({ messsage: 'Sim card atualizado com sucesso' });
}
