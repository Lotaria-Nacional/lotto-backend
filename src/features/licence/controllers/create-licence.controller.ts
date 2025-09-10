import { Licence } from './../@types/licence.t';
import type { Request, Response } from 'express';
import { createLicenceService } from '../services';
import { AuthPayload } from '../../../@types/auth-payload';
import { createLicenceSchema } from '@lotaria-nacional/lotto';
import { HttpStatus } from '../../../constants/http';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function createLicenceController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'CREATE',
      subject: 'LICENCE',
    },
  });

  const body = createLicenceSchema.parse(req.body);

  const { id } = await createLicenceService({ ...body, user });

  return res.status(HttpStatus.CREATED).json({
    id,
    message: 'Licença criada',
  });
}
