import app from '../../src';
import request from 'supertest';
import { auth } from './auth';
import { makeGroup } from '../factories/make-group';
import { CreateGroupDTO } from '../../src/features/group/schemas/create.schema';
import { Group } from '../../src/features/group/@types/group.t';

export async function createGroup(data?: Partial<CreateGroupDTO>) {
  const group = makeGroup(data);
  const res = await auth(request(app).post('/api/groups')).send(group);
  expect(res.status).toBe(201);

  return res.body as Group;
}

export async function getGroup(id: string) {
  const response = await auth(request(app).get(`/api/groups/${id}`));
  return response.body as Group & { message: string };
}
