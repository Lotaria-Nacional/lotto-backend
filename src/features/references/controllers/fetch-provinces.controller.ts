import type { Request, Response } from 'express';
import { fetchManyProvincesService } from '../services';

export async function fetchProvincesController(_req: Request, res: Response) {
  const response = await fetchManyProvincesService();
  return res.status(200).json(response);
}
