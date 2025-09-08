import type { Response, Request } from 'express';
import { fetchManyGroupsService } from '../services/fetch-groups.service';
import { HttpStatus } from '../../../constants/http';

export async function fetchManyGroupsController(req: Request, res: Response) {
  const response = await fetchManyGroupsService();
  return res.status(HttpStatus.OK).json(response);
}
