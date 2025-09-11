import type { Request, Response } from 'express';
import { fetchManyUsersService } from '../services';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { paramsSchema } from '../../../schemas/common/query.schema';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function fetchManyUsersController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  const params = paramsSchema.parse(req.query);

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'READ',
      subject: 'USER',
    },
  });

  const response = await fetchManyUsersService(params);

  return res.status(HttpStatus.OK).json(response);
}
