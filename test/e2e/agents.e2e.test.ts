import app from '../../src';
import request from 'supertest';
import { token } from '../setup';
import { makeAgent } from '../factories/make-agent';
import { createAgent, getAgent } from '../utils/agent';

describe('E2E - Agents', () => {
  it('should be able to create an agent', async () => {
    const { id } = await createAgent();

    const agent = await getAgent(id);
    expect(agent.first_name).toBe('Paulo');
    expect(agent.status).toBe('scheduled');
  });

  it('should be able to update an existing agent', async () => {
    const agent = makeAgent({ first_name: 'Juclénio' });
    const res = await request(app).post('/api/agents').set('authorization', `Bearer ${token}`).send(agent);
    const agentId = res.body.data.id;

    await request(app)
      .put(`/api/agents/${agentId}`)
      .set('authorization', `Bearer ${token}`)
      .send({ first_name: 'Sebastião', last_name: 'António' });

    const getRes = await request(app).get(`/api/agents/${agentId}`).set('authorization', `Bearer ${token}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.first_name).toBe('Sebastião');
    expect(getRes.body.last_name).toBe('António');
  });

  it('should be able to get a single agent', async () => {
    const agent = makeAgent({ first_name: 'Juclénio', last_name: 'António' });
    const res = await request(app).post('/api/agents').set('authorization', `Bearer ${token}`).send(agent);
    const agentId = res.body.data.id;

    const getRes = await request(app).get(`/api/agents/${agentId}`).set('authorization', `Bearer ${token}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.first_name).toBe('Juclénio');
    expect(getRes.body.last_name).toBe('António');
  });

  it('should be able to fetch many agents', async () => {
    const agent01 = makeAgent({ first_name: 'Juclénio', last_name: 'António' });
    const agent02 = makeAgent({ first_name: 'Délcio', last_name: 'Issanzo' });

    await Promise.all([
      request(app).post('/api/agents').set('authorization', `Bearer ${token}`).send(agent01),
      request(app).post('/api/agents').set('authorization', `Bearer ${token}`).send(agent02),
    ]);

    const getRes = await request(app).get(`/api/agents`).set('authorization', `Bearer ${token}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body).toHaveLength(2);
  });

  it('should be able to fetch many agents with filters', async () => {
    const agent01 = makeAgent({ first_name: 'Juclénio', last_name: 'António' });
    const agent02 = makeAgent({ first_name: 'Délcio', last_name: 'Issanzo' });
    const agent03 = makeAgent({ first_name: 'Sebastião', last_name: 'Simão' });

    await Promise.all([
      request(app).post('/api/agents').set('authorization', `Bearer ${token}`).send(agent01),
      request(app).post('/api/agents').set('authorization', `Bearer ${token}`).send(agent02),
      request(app).post('/api/agents').set('authorization', `Bearer ${token}`).send(agent03),
    ]);

    const getRes = await request(app).get(`/api/agents?limit=2`).set('authorization', `Bearer ${token}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body).toHaveLength(2);
  });
});
