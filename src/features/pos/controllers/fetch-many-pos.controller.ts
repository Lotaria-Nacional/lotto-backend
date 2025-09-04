import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '../../../@types/auth-payload';
import { fetchManyPos } from '../services/fetch-many-pos.service';
import { paramsSchema } from '../../../schemas/common/query.schema';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function fetchManyPosController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  // await hasPermission({
  //   res,
  //   userId: user.id,
  //   permission: {
  //     action: 'READ',
  //     subject: 'Pos',
  //   },
  // });

  const query = paramsSchema.parse(req.query);

  const result = await fetchManyPos(query);

  return res.status(HttpStatus.OK).json(result);
}
