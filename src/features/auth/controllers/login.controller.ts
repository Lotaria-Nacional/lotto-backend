import type { Request, Response } from 'express';
import { oneDayFromNowInMs } from '../../../utils/date';
import { loginSchema } from '../schemas/login.schema';
import { loginService } from '../services/login.service';

export async function loginController(req: Request, res: Response) {
  const body = loginSchema.parse(req.body);

  const { accessToken, refreshToken } = await loginService(body);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: oneDayFromNowInMs,
  });

  return res.status(200).json({ accessToken });
}
