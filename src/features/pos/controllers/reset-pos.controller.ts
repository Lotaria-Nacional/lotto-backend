import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '../../../@types/auth-payload';
import { idSchema } from '../../../schemas/common/id.schema';
import { resetPosService } from '../services/reset-pos-service';

export async function resetPosController(req: Request, res: Response) {
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

  await resetPosService(id);

  return res.status(HttpStatus.OK).json({
    message: 'POS resetado com sucesso',
  });
}
