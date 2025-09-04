import jwt, { JwtPayload } from 'jsonwebtoken';

export type JwtError = jwt.VerifyErrors | null;

export type JwtDecoded = JwtPayload | string | undefined;
