import { HttpStatus } from '../constants/http';
import AppError from './app-error';

export default class BadRequestError extends AppError {
  constructor(message = 'Requisição inválida.') {
    super(message, HttpStatus.BAD_REQUEST);
  }
}
