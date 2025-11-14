import { createPosService } from '../services';
import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '../../../@types/auth-payload';
import { hasPermission } from '../../../middleware/auth/permissions';
import { createPosSchema } from '@lotaria-nacional/lotto';

export async function createPosController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'CREATE',
      subject: 'POS',
    },
  });

  const file = req.file;
  const body = createPosSchema.parse(req.body);

  const response = await createPosService({ ...body, user, file });

  return res.status(HttpStatus.CREATED).json({
    message: 'O POS foi criado',
    id: response,
  });
}
