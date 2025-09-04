import { HttpStatus } from '../constants/http';
import AppError from './app-error';

export default class ForbiddenError extends AppError {
  constructor(message = 'Acesso Proibido.') {
    super(message, HttpStatus.FORBIDDEN);
  }
}
