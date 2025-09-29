import { Request, Response } from 'express';
import { updateGroupService } from '../services';
import { HttpStatus } from '../../../constants/http';
import { idSchema } from '../../../schemas/common/id.schema';
import { hasPermission } from '../../../middleware/auth/permissions';
import { AuthPayload, updateGroupSchema } from '@lotaria-nacional/lotto';

export async function updateGroupController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'UPDATE',
      subject: 'GROUP',
    },
  });

  const { id } = idSchema.parse(req.params);

  const body = updateGroupSchema.parse({ ...req.body, id });

  const response = updateGroupService(body, user);

  return res.status(HttpStatus.OK).json({ message: 'Grupo atualizado com sucesso', id: response });
}
