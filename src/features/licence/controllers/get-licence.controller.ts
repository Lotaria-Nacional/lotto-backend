import { getLicenceService } from '../services';
import type { Request, Response } from 'express';
import { AuthPayload } from '../../../@types/auth-payload';
import { idSchema } from '../../../schemas/common/id.schema';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function getLicenceController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  // await hasPermission({
  //   res,
  //   userId: user.id,
  //   permission: {
  //     action: 'READ',
  //     subject: 'Licences',
  //   },
  // });

  const { id } = idSchema.parse(req.params);
  const response = await getLicenceService(id);

  return res.status(200).json(response);
}
