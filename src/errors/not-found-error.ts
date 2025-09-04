import { HttpStatus } from '../constants/http';
import AppError from './app-error';

export default class NotFoundError extends AppError {
  constructor(message = 'Recurso não encotrado.') {
    super(message, HttpStatus.NOT_FOUND);
  }
}
