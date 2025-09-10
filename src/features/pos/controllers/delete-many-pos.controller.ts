import type { Request, Response } from 'express';

import { deleteManyPosService } from '../services';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '../../../@types/auth-payload';
import { idsSchema } from '../../../schemas/common/id.schema';

export async function deleteManyPosController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  const { ids } = idsSchema.parse(req.body);

  await deleteManyPosService(ids, user);

  return res.status(HttpStatus.OK).json({
    message: `POS's removidos`,
  });
}
