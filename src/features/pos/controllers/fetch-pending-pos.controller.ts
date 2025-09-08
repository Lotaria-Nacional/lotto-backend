import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '../../../@types/auth-payload';
import { paramsSchema } from '../../../schemas/common/query.schema';
import { hasPermission } from '../../../middleware/auth/permissions';
import { fetchPoService } from '../services';

export async function fetchPendingPosController(req: Request, res: Response) {
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

  const result = await fetchPoService({ ...query, status: 'pending' });

  return res.status(HttpStatus.OK).json(result);
}
