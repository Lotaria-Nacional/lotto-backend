import { getUserService } from '../services';
import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { idSchema } from '../../../schemas/common/id.schema';

export async function getUserController(req: Request, res: Response) {
  const { id } = idSchema.parse(req.params);

  const response = await getUserService(id);

  return res.status(HttpStatus.OK).json(response);
}
