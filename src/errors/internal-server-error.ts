import { HttpStatus } from '../constants/http';
import AppError from './app-error';

export default class InternalServerError extends AppError {
  constructor(message = 'Erro interno no servidor.') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
