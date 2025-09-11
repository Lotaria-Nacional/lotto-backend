import app from '../../src';
import request from 'supertest';
import { auth } from '../utils/auth';
import { makePos } from '../factories/make-pos';
import { createPos, getPos } from '../utils/pos';
import { Pos } from '../../src/features/pos/@types/pos.t';

export const posURL = '/api/pos' as const;

describe('E2E - Pos', () => {
  it('should be able to create a pos', async () => {
    const { id } = await createPos();
    const pos = await getPos(id);

    expect(pos.status).toBe('pending');
    expect(pos.province.name).toBe('Luanda');
  });

  it('should be able to update a pos', async () => {
    const { id } = await createPos();

    const data = makePos({
      latitude: 13.987678,
      longitude: -12.987678,
    });

    const { status } = await auth(request(app).put(`${posURL}/${id}`)).send(data);
    expect(status).toBe(200);

    const pos = await getPos(id);

    expect(pos.id).toBe(id);
    expect(pos.status).toBe('pending');
    expect(pos.coordinates).toEqual(expect.stringMatching('13,-12'));
  });

  it('should be able to delete a pos', async () => {
    const { id } = await createPos();

    const { status } = await auth(request(app).delete(`${posURL}/${id}`));
    expect(status).toBe(200);

    await expect(getPos(id)).resolves.toHaveProperty('message', 'Pos não encontrado');
  });

  it('should be able to delete many a pos`s ', async () => {
    const { id: id01 } = await createPos();
    const { id: id02 } = await createPos();

    const data = { ids: [id01, id02] };

    const { status } = await auth(request(app).delete(`${posURL}/bulk`)).send(data);
    expect(status).toBe(200);

    const response = await auth(request(app).get('/api/pos'));
    const posList = response.body as Pos[];
    expect(posList).toHaveLength(0);
  });

  it('should be able to fetch all pos', async () => {
    await createPos({ latitude: 13.987678, longitude: -12.987678 });
    await createPos({ latitude: 13.987678, longitude: -12.987678 });

    const response = await auth(request(app).get('/api/pos'));
    const posList: Pos[] = response.body;

    expect(response.status).toBe(200);
    expect(posList).toHaveLength(2);
    expect(posList[0].coordinates).toBe('10,000,-13,000');
    expect(posList[1].coordinates).toBe('12,000,-14,000');
  });
});
