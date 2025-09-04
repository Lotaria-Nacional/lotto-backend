import type { Response, Request } from 'express';
import { AuthPayload } from '../../../@types/auth-payload';
import { getUserPermissionsService } from '../services/get-user-permissions.service';

export async function getUserPermissionsController(req: Request, res: Response) {
  const { id } = req.user as AuthPayload;
  const permissions = await getUserPermissionsService(id);

  res.status(200).json(permissions);
}
