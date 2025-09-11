import app from '../../src';
import { auth } from './auth';
import request from 'supertest';
import { makeSimCard } from '../factories/make-sim-card';
import { SimCard } from '../../src/features/sim-card/@types/sim-card.t';
import { CreateSimCardDTO } from '@lotaria-nacional/lotto';

export async function createSimCard(data?: Partial<CreateSimCardDTO>) {
  const simCard = makeSimCard(data);
  const response = await auth(request(app).post('/api/sim-cards')).send(simCard);
  expect(response.status).toBe(201);

  return response.body as SimCard;
}

export async function getSimCard(id: string) {
  const response = await auth(request(app).get(`/api/sim-cards/${id}`));
  return response.body as SimCard & { message: string };
}
