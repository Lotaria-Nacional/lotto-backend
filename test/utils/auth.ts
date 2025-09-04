import { token } from '../setup';
import request from 'supertest';

export const auth = (req: request.Test) => req.set('authorization', `Bearer ${token}`);
