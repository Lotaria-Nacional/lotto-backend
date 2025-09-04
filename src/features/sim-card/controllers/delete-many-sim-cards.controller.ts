import type { Request, Response } from 'express';
import { idsSchema } from '../../../schemas/common/id.schema';
import { deleteManySimCardsService } from '../services';
import { HttpStatus } from '../../../constants/http';

export async function deleteManySimCardsController(req: Request, res: Response) {
  const { ids } = idsSchema.parse(req.body);
  await deleteManySimCardsService(ids);

  return res.status(HttpStatus.OK).json({ message: 'Sim cards removidos com sucesso' });
}
