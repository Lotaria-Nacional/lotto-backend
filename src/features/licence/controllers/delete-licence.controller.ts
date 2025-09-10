import type { Request, Response } from 'express';
import { AuthPayload } from '../../../@types/auth-payload';
import { idSchema } from '../../../schemas/common/id.schema';
import { deleteLicenceService } from '../services';
import { HttpStatus } from '../../../constants/http';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function deleteLicenceController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'DELETE',
      subject: 'LICENCE',
    },
  });

  const { id } = idSchema.parse(req.params);

  await deleteLicenceService(id, user);

  return res.status(HttpStatus.OK).json({
    message: 'Licença removida.',
  });
}
