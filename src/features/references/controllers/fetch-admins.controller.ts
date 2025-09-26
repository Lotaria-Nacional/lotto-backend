import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { fetchManyAdminsService } from '../services';
import { paramsSchema } from '../../../schemas/common/query.schema';

export async function fetchAdminsController(req: Request, res: Response) {
  const params = paramsSchema.parse(req.query);

  const response = await fetchManyAdminsService(params);

  return res.status(HttpStatus.OK).json(response);
}
