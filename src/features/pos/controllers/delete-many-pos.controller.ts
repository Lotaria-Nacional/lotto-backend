import type { Request, Response } from 'express';

import { deleteManyPosService } from '../services';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '../../../@types/auth-payload';
import { idSchema, idsSchema } from '../../../schemas/common/id.schema';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function deleteManyPosController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  // await hasPermission({
  //   res,
  //   userId: user.id,
  //   permission: {
  //     action: 'DELETE',
  //     subject: 'Pos',
  //   },
  // });

  const { ids } = idsSchema.parse(req.body);

  await deleteManyPosService(ids, user);

  return res.status(HttpStatus.OK).json({
    message: `Pos's removidos com sucesso`,
  });
}
