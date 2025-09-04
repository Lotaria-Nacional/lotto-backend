import { ZodError } from 'zod';
import { AppError } from '../errors';
import { HttpStatus } from '../constants/http';
import type { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    console.error(`PATH: ${req.path} - METHOD: ${req.method}`, err);
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    console.error(`PATH: ${req.path} - METHOD: ${req.method}`, err);
    return res.status(HttpStatus.BAD_REQUEST).json({
      error: 'Dados inválidos',
      message: err.issues,
    });
  }

  console.error(`UNHANDLED ERRRO - PATH: ${req.path} - METHOD: ${req.method}`, err);

  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    message: 'Erro interno do servidor.',
  });
}
