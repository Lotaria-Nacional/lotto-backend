import type { Request, Response } from 'express';
import { AuthPayload } from '../../../@types/auth-payload';
import { buildUserAbillity } from '../../../permissions/build-abillity';
import { HttpStatus } from '../../../constants/http';
import { idSchema } from '../../../schemas/common/id.schema';
import { getTerminalService } from '../services';

export async function getTerminalController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  const ability = await buildUserAbillity(user.id);

  // if (!ability.can('read', 'Terminals')) {
  //   return res.status(HttpStatus.FORBIDDEN).json({ message: 'Você não tem permissão' });
  // }

  const { id } = idSchema.parse(req.params);

  const response = await getTerminalService(id);

  return res.status(200).json(response);
}
