import type { Request, Response } from 'express';
import { fetchManyAreasService } from '../services';

export async function fetchAreasController(_req: Request, res: Response) {
  const response = await fetchManyAreasService();
  return res.status(200).json(response);
}
