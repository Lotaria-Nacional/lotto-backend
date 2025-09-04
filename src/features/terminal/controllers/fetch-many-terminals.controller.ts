import type { Request, Response } from 'express';
import { AuthPayload } from '../../../@types/auth-payload';
import { buildUserAbillity } from '../../../permissions/build-abillity';
import { HttpStatus } from '../../../constants/http';
import { paramsSchema } from '../../../schemas/common/query.schema';
import { fetchManyTerminalsService } from '../services';

export async function fetchManyTerminalsController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  const ability = await buildUserAbillity(user.id);

  // if (!ability.can('read', 'Terminals')) {
  //   return res.status(HttpStatus.FORBIDDEN).json({ message: 'Você não tem permissão' });
  // }

  const query = paramsSchema.parse(req.query);
  const response = await fetchManyTerminalsService(query);

  return res.status(200).json(response);
}
