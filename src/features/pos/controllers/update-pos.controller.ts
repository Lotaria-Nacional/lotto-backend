import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '../../../@types/auth-payload';
import { updatePosSchema } from '../schemas/update.schema';
import { updatePosService } from '../services/update-pos.service';
import { idSchema } from '../../../schemas/common/id.schema';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function updatePosController(req: Request, res: Response) {
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
  const body = updatePosSchema.parse({ ...req.body, id, user });

  const response = await updatePosService(body);

  return res.status(HttpStatus.OK).json({
    message: 'POS atualizado com sucesso',
  });
}
