import { Request, Response } from 'express';
import { AuthPayload } from '../../../@types/auth-payload';
import redis from '../../../lib/redis';

export async function getProfileController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  const cacheKey = `profile:${user.id}`;

  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.status(200).json({ user: JSON.parse(cached) });
  }

  // Guarda no Redis
  const exptime = 24 * 60 * 60; // 24h em segundos
  await redis.set(cacheKey, JSON.stringify(user), 'EX', exptime);

  return res.status(200).json({ user });
}
