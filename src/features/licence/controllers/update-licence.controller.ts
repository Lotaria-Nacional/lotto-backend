import type { Request, Response } from 'express';
import { AuthPayload } from '../../../@types/auth-payload';
import { idSchema } from '../../../schemas/common/id.schema';
import { updateLicenceService } from '../services';
import { hasPermission } from '../../../middleware/auth/permissions';
import { updateLicenceSchema } from '@lotaria-nacional/lotto';
import { HttpStatus } from '../../../constants/http';

export async function updateLicenceController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'UPDATE',
      subject: 'LICENCE',
    },
  });

  const { id } = idSchema.parse(req.params);

  const body = updateLicenceSchema.parse({ ...req.body, id });

  console.log(body);

  const response = await updateLicenceService({ ...body, user });

  return res.status(HttpStatus.OK).json({
    data: response,
    message: 'Licença atualizada',
  });
}
