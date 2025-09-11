import app from '../../src';
import { auth } from './auth';
import request from 'supertest';
import { makeAgent } from '../factories/make-agent';
import { Agent, CreateAgentDTO } from '@lotaria-nacional/lotto';

export async function createAgent(data?: Partial<CreateAgentDTO>) {
  const agent = makeAgent(data);
  const response = await auth(request(app).post('/api/agents')).send(agent);

  expect(response.status).toBe(201);

  return { id: response.body.id as string };
}

export async function getAgent(id: string) {
  const response = await auth(request(app).get(`/api/agents/${id}`));
  const agent = response.body as Agent & { message: string };
  return agent;
}
