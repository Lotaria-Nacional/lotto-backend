import { HttpStatus } from '../constants/http';
import AppError from './app-error';

export default class ConflictError extends AppError {
  constructor(message = 'Conflito de dados.') {
    super(message, HttpStatus.CONFLICT);
  }
}
