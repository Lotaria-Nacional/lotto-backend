import request from 'supertest';
import app from '../../src/index';
import { token } from '../setup';
import { makeAgent } from '../factories/make-agent';

describe('E2E - AGENTS', () => {
  it('should be to create an agent', async () => {
    const agent = makeAgent();
    const res = await request(app).post('/api/agents').set('authorization', `Bearer ${token}`).send(agent);

    // const id = res.body.response;
    expect(res.status).toBe(200);
  });
});
