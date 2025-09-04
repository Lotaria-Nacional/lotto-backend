import jwt from 'jsonwebtoken';
import env from '../../constants/env';
import { JwtError } from '../../@types/jwt';
import { HttpStatus } from '../../constants/http';
import { AuthPayload } from '../../@types/auth-payload';
import { NextFunction, Response, Request } from 'express';

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Não autorizado.' });

  jwt.verify(token, env.JWT_ACCESS_TOKEN_SECRET, (err: JwtError, user) => {
    if (err) return res.status(HttpStatus.FORBIDDEN).json({ message: 'Acesso proibido.' });
    req.user = user as AuthPayload;

    next();
  });
}
