import type { Request, Response } from 'express';
import { fetchManyTypesService } from '../services';

export async function fetchTypesController(_req: Request, res: Response) {
  const response = await fetchManyTypesService();
  return res.status(200).json(response);
}
