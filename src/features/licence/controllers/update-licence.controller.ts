import type { Request, Response } from 'express';
import { AuthPayload } from '../../../@types/auth-payload';
import { idSchema } from '../../../schemas/common/id.schema';
import { updateLicenceSchema } from '../schemas/update-licence.schema';
import { updateLicenceService } from '../services';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function updateLicenceController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  // await hasPermission({
  //   res,
  //   userId: user.id,
  //   permission: {
  //     action: 'UPDATE',
  //     subject: 'Licences',
  //   },
  // });

  const { id } = idSchema.parse(req.params);
  const body = updateLicenceSchema.parse({ ...req.body, id, user });

  const response = await updateLicenceService(body);

  return res.status(200).json({
    message: 'Licença atualizada com sucesso',
    data: response,
  });
}
