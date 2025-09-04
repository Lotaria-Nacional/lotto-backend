import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import redis from '../../../lib/redis';

export async function logoutController(req: Request, res: Response) {
  res.clearCookie('refreshToken');

  const userId = req.user?.id;
  if (userId) {
    const cacheKey = `profile:${userId}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      await redis.del(cacheKey);
    }
  }

  req.user = undefined;

  return res.status(HttpStatus.OK).json({ message: 'Logout realizado com sucesso.' });
}
