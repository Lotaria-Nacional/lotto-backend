import type { Request, Response } from 'express';
import { resetSimCardService } from '../services';
import { HttpStatus } from '../../../constants/http';
import { idSchema } from '../../../schemas/common/id.schema';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function resetSimCardController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'RESET',
      subject: 'SIM_CARD',
    },
  });

  const { id } = idSchema.parse(req.params);

  await resetSimCardService(id, user);

  return res.status(HttpStatus.OK).json({ messsage: 'Sim card resetado com sucesso' });
}
