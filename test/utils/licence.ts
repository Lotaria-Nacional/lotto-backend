import app from '../../src';
import { auth } from './auth';
import request from 'supertest';
import { makeLicence } from '../factories/make-licence';
import { Licence } from '../../src/features/licence/@types/licence.t';
import { CreateLicenceDTO } from '../../src/features/licence/schemas/create-licence.schema';

export async function createLicence(data?: Partial<CreateLicenceDTO>) {
  const licence = makeLicence(data);
  const res = await auth(request(app).post('/api/licences')).send(licence);
  expect(res.status).toBe(201);

  return res.body as Licence;
}

export async function getLicence(id: string) {
  const response = await auth(request(app).get(`/api/licences/${id}`));
  return response.body as Licence & { message: string };
}
