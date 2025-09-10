import type { Request, Response } from 'express';
import { fetchSimCardsService } from '../services';
import { HttpStatus } from '../../../constants/http';
import { paramsSchema } from '../../../schemas/common/query.schema';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function fetchSimCardsController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'READ',
      subject: 'SIM_CARD',
    },
  });
  const query = paramsSchema.parse(req.query);
  const response = await fetchSimCardsService({ ...query, status: 'active' });
  return res.status(HttpStatus.OK).json(response);
}
