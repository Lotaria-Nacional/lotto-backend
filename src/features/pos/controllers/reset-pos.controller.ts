import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { idSchema } from '../../../schemas/common/id.schema';
import { resetPosService } from '../services/reset-pos-service';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function resetPosController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'RESET',
      subject: 'POS',
    },
  });

  const { id } = idSchema.parse(req.params);

  await resetPosService(id, user);

  return res.status(HttpStatus.OK).json({
    message: 'O POS foi resetado',
  });
}
