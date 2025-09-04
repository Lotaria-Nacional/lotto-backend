import type { Request, Response } from 'express';
import { fetchManyAdminsService } from '../services';

export async function fetchAdminsController(_req: Request, res: Response) {
  const response = await fetchManyAdminsService();
  return res.status(200).json(response);
}
