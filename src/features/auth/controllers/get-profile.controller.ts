import { Request, Response } from 'express';
import { AuthPayload } from '../../../@types/auth-payload';
import { getUserPermissionsService } from '../services/get-user-permissions.service';
import redis from '../../../lib/redis';
import { HttpStatus } from '../../../constants/http';
import { setCache } from '../../../utils/redis';

export async function getProfileController(req: Request, res: Response) {
  const user = req.user as AuthPayload;
  const cacheKey = `profile:${user.id}`;

  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.status(HttpStatus.OK).json(JSON.parse(cached));
  }

  const permissions = await getUserPermissionsService(user.id);

  const payload = {
    user,
    permissions,
  };

  await setCache(cacheKey, payload);

  return res.status(HttpStatus.OK).json(payload);
}
