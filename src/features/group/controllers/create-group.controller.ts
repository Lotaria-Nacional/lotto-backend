import type { Response, Request } from 'express';
import { createGroupSchema } from '../schemas/create.schema';
import { createGroupService } from '../services/create-group.service';
import { HttpStatus } from '../../../constants/http';

export async function createGroupController(req: Request, res: Response) {
  const body = createGroupSchema.parse(req.body);
  const response = await createGroupService(body);

  return res.status(HttpStatus.CREATED).json({ id: response });
}
