import type { Request, Response } from 'express';
import { fetchManyUsersService } from '../services';
import { HttpStatus } from '../../../constants/http';
import { paramsSchema } from '../../../schemas/common/query.schema';

export async function fetchManyUsersController(req: Request, res: Response) {
  const params = paramsSchema.parse(req.query);
  const response = await fetchManyUsersService(params);

  return res.status(HttpStatus.OK).json(response);
}
