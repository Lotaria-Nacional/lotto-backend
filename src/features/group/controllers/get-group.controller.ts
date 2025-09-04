import type { Request, Response } from 'express';
import { getGroupService } from '../services/get-group.services';
import { idSchema } from '../../../schemas/common/id.schema';
import { HttpStatus } from '../../../constants/http';

export async function getGroupsController(req: Request, res: Response) {
  const { id } = idSchema.parse(req.params);

  const response = await getGroupService(id);
  return res.status(HttpStatus.OK).json(response);
}
