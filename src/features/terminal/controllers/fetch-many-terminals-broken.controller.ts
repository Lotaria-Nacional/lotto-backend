import type { Request, Response } from 'express';
import { AuthPayload } from '../../../@types/auth-payload';
import { HttpStatus } from '../../../constants/http';
import { paramsSchema } from '../../../schemas/common/query.schema';
import { fetchTerminalsService } from '../services';
import { fetchBrokenTerminals } from '../services/fetch-terminals-by-status.service';

export async function fetchBrokenTerminalsController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  const query = paramsSchema.parse(req.query);
  const response = await fetchBrokenTerminals(query);

  return res.status(HttpStatus.OK).json(response);
}
