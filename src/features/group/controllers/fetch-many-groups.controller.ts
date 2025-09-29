import type { Response, Request } from 'express';
import { fetchManyGroupsService } from '../services/fetch-groups-service';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function fetchManyGroupsController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'READ',
      subject: 'GROUP',
    },
  });

  const response = await fetchManyGroupsService();
  return res.status(HttpStatus.OK).json(response);
}
