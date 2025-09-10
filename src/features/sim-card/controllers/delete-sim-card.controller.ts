import type { Request, Response } from 'express';
import { idSchema } from '../../../schemas/common/id.schema';
import { deleteSimCardService } from '../services';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function deleteSimCardController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'DELETE',
      subject: 'SIM_CARD',
    },
  });

  const { id } = idSchema.parse(req.params);

  const response = await deleteSimCardService(id, user);

  return res.status(HttpStatus.OK).json({ message: 'Sim card removido com sucesso', id: response.id });
}
