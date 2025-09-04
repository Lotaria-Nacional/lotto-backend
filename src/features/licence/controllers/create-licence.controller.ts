import { createLicenceService } from '../services';
import type { Request, Response } from 'express';
import { AuthPayload } from '../../../@types/auth-payload';
import { hasPermission } from '../../../middleware/auth/permissions';
import { createLicenceSchema } from '../schemas/create-licence.schema';

export async function createLicenceController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  // await hasPermission({
  //   res,
  //   userId: user.id,
  //   permission: {
  //     action: 'CREATE',
  //     subject: 'Licences',
  //   },
  // });

  const body = createLicenceSchema.parse({ ...req.body, user });
  const { id } = await createLicenceService(body);

  return res.status(201).json({
    message: 'Licença criada com sucesso',
    id,
  });
}
