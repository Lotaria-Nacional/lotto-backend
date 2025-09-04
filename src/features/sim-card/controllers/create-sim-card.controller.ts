import { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { createSimCardSchema } from '../schemas/create-sim-card.schema';
import { createSimCardService } from '../services';

export async function createSimCardController(req: Request, res: Response) {
  const user = req.user;
  const body = createSimCardSchema.parse({ ...req.body, user });
  const { id } = await createSimCardService(body);

  return res.status(HttpStatus.CREATED).json({ id });
}
