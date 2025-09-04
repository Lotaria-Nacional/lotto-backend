import type { Request, Response } from 'express';
import { AuthPayload } from '../../../@types/auth-payload';
import { buildUserAbillity } from '../../../permissions/build-abillity';
import { HttpStatus } from '../../../constants/http';
import { idSchema } from '../../../schemas/common/id.schema';
import { deleteTerminalService } from '../services';

export async function deleteTerminalController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  const ability = await buildUserAbillity(user.id);

  // if (!ability.can('delete', 'Terminals')) {
  //   return res.status(HttpStatus.FORBIDDEN).json({ message: 'Você não tem permissão' });
  // }

  const { id } = idSchema.parse(req.params);

  await deleteTerminalService(id, user);

  return res.status(200).json({
    message: 'Terminal removido com sucesso',
  });
}
