import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '../../../@types/auth-payload';
import { idSchema } from '../../../schemas/common/id.schema';
import { denyPosService } from '../services/deny-pos-service';

export async function denyPosController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  // await hasPermission({
  //   res,
  //   userId: user.id,
  //   permission: {
  //     action: 'UPDATE',
  //     subject: 'Pos',
  //   },
  // });

  const { id } = idSchema.parse(req.params);

  await denyPosService(id);

  return res.status(HttpStatus.OK).json({
    message: 'POS foi negado',
  });
}
