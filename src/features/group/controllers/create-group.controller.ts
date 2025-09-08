import type { Response, Request } from 'express';
import { createGroupService } from '../services/create-group.service';
import { HttpStatus } from '../../../constants/http';
import { createGroupSchema } from '@lotaria-nacional/lotto';

export async function createGroupController(req: Request, res: Response) {
  const body = createGroupSchema.parse(req.body);
  const response = await createGroupService(body);

  return res.status(HttpStatus.CREATED).json({ id: response });
}
