import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { getPosService } from '../services/get-pos.service';
import { AuthPayload } from '../../../@types/auth-payload';
import { idSchema } from '../../../schemas/common/id.schema';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function getPosController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  // await hasPermission({
  //   res,
  //   userId: user.id,
  //   permission: {
  //     action: 'READ',
  //     subject: 'Pos',
  //   },
  // });

  const { id } = idSchema.parse(req.params);
  const response = await getPosService(id);

  return res.status(HttpStatus.OK).json(response);
}
