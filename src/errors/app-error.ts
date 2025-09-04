import { HttpStatus } from '../constants/http';

export default class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode || HttpStatus.BAD_REQUEST;
    Error.captureStackTrace(this, this.constructor);
  }
}
