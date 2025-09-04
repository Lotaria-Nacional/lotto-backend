import app from '../../src';
import { auth } from './auth';
import request from 'supertest';
import { makePos } from '../factories/make-pos';
import { Pos } from '../../src/features/pos/@types/pos.t';
import { CreatePosDTO } from '../../src/features/pos/schemas/create-pos.schema';

export async function createPos(data?: Partial<CreatePosDTO>) {
  const pos = makePos(data);
  const response = await auth(request(app).post('/api/pos')).send(pos);
  expect(response.status).toBe(201);

  return response.body as Pos;
}

export async function getPos(id: string) {
  const response = await auth(request(app).get(`/api/pos/${id}`));
  return response.body as Pos & { message: string };
}
