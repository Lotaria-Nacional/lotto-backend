import type { Request, Response } from 'express';
import { idSchema } from '../../../schemas/common/id.schema';
import { getUserService } from '../services';

export async function getUserController(req: Request, res: Response) {
  const { id } = idSchema.parse(req.params);

  const response = await getUserService(id);

  return res.status(200).json(response);
}
