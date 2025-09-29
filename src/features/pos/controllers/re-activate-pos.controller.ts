import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { idSchema } from '../../../schemas/common/id.schema';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { hasPermission } from '../../../middleware/auth/permissions';
import { reactivatePosService } from '../services/re-activate-pos-service';

export async function reactivatePosController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'REACTIVATE',
      subject: 'POS',
    },
  });

  const { id } = idSchema.parse(req.params);

  await reactivatePosService(id, user);

  return res.status(HttpStatus.OK).json({
    message: 'O POS foi reativado',
  });
}
