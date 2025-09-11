import { Request, Response } from 'express';
import { idSchema } from '../../../schemas/common/id.schema';
import { deleteGroupService } from '../services';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function deleteGroupController(req: Request, res: Response) {
  const user = req.user as AuthPayload;
  const { id } = idSchema.parse(req.params);

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'DELETE',
      subject: 'GROUP',
    },
  });

  await deleteGroupService(id);

  return res.status(HttpStatus.OK).json({ message: 'Grupo removido com sucesso' });
}
