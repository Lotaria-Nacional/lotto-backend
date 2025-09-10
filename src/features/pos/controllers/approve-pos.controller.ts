import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { idSchema } from '../../../schemas/common/id.schema';
import { approvePosService } from '../services/approve-pos-service';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function approvePosController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'APPROVE',
      subject: 'POS',
    },
  });

  const { id } = idSchema.parse(req.params);

  await approvePosService(id, user);

  return res.status(HttpStatus.OK).json({
    message: 'POS foi aprovado',
  });
}
