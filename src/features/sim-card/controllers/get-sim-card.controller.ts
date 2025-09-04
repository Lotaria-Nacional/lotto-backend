import type { Request, Response } from 'express';
import { getSimCardService } from '../services';
import { idSchema } from '../../../schemas/common/id.schema';
import { HttpStatus } from '../../../constants/http';

export async function getSimCardController(req: Request, res: Response) {
  const { id } = idSchema.parse(req.params);

  const simCard = await getSimCardService(id);

  return res.status(HttpStatus.OK).json(simCard);
}
