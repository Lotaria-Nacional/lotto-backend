import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '../../../@types/auth-payload';
import { fetchPoService } from '../services/fetch-pos.service';
import { paramsSchema } from '../../../schemas/common/query.schema';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function fetchPosController(req: Request, res: Response) {
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

  const result = await fetchPoService({ ...query, status: 'active' });

  return res.status(HttpStatus.OK).json(result);
}
