import type { Request, Response } from 'express';
import { fetchSimCardsService } from '../services';
import { HttpStatus } from '../../../constants/http';
import { paramsSchema } from '../../../schemas/common/query.schema';

export async function fetchSimCardsController(req: Request, res: Response) {
  const query = paramsSchema.parse(req.query);
  const response = await fetchSimCardsService({ ...query, status: 'active' });
  return res.status(HttpStatus.OK).json(response);
}
