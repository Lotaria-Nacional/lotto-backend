import type { Request, Response } from 'express';
import { paramsSchema } from '../../../schemas/common/query.schema';
import { fetchManyUsersService } from '../services';

export async function fetchManyUsersController(req: Request, res: Response) {
  const params = paramsSchema.parse(req.query);
  const response = await fetchManyUsersService(params);

  return res.status(200).json(response);
}
