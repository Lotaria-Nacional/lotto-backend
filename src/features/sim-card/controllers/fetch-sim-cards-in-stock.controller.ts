import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '../../../@types/auth-payload';
import { paramsSchema } from '../../../schemas/common/query.schema';
import { fetchSimCardsService } from '../services';

export async function fetchSimCardsInStockController(req: Request, res: Response) {
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
  const result = await fetchSimCardsService({ ...query, status: 'stock' });

  return res.status(HttpStatus.OK).json(result);
}
