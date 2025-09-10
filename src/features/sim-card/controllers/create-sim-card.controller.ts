import { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { createSimCardService } from '../services';
import { AuthPayload } from '../../../@types/auth-payload';
import { createSimCardSchema } from '@lotaria-nacional/lotto';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function createSimCardController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'CREATE',
      subject: 'SIM_CARD',
    },
  });

  const body = createSimCardSchema.parse(req.body);

  const { id } = await createSimCardService({ ...body, user });

  return res.status(HttpStatus.CREATED).json({ id, message: 'Sim card criado' });
}
