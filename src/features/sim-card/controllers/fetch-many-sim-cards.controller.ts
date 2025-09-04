import type { Request, Response } from 'express';
import { fetchManySimCardsService } from '../services';
import { HttpStatus } from '../../../constants/http';

export async function fetchManySimCardsController(_req: Request, res: Response) {
  const { simCards } = await fetchManySimCardsService();

  return res.status(HttpStatus.OK).json(simCards);
}
