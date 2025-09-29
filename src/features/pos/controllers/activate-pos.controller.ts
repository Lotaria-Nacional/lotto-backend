import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '../../../@types/auth-payload';
import { updatePosSchema } from '@lotaria-nacional/lotto';
import { idSchema } from '../../../schemas/common/id.schema';
import { activatePosService } from '../services/activate-pos-service';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function activatePosController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'ACTIVATE',
      subject: 'POS',
    },
  });

  const { id } = idSchema.parse(req.params);

  const body = updatePosSchema.parse({ ...req.body, id });

  await activatePosService({ ...body, user });

  return res.status(HttpStatus.OK).json({
    message: 'POS ativado',
  });
}
