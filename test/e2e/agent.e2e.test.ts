import app from '../../src';
import request from 'supertest';
import { auth } from '../utils/auth';
import { createPos } from '../utils/pos';
import { createTerminal } from '../utils/terminal';
import { makeAgent } from '../factories/make-agent';
import { createAgent, getAgent } from '../utils/agent';
import { Agent } from '@lotaria-nacional/lotto';

export const agentURL = '/api/agents';

describe('E2E - Agent', () => {
  it('should be able to create an agent', async () => {
    const { id } = await createAgent();
    const agent = await getAgent(id);

    expect(agent.status).toBe('scheduled');
    expect(agent.first_name).toBe('Paulo');
    expect(agent.last_name).toBe('Luguenda');
    expect(agent.genre).toBe('male');
    expect(agent.agent_type).toBe('lotaria_nacional');
    expect(agent.phone_number).toBe(941685402);
    expect(agent.afrimoney_number).toBe(null);
  });

  it('should be able to update an agent', async () => {
    const { id } = await createAgent();

    const { id: postId } = await createPos();
    const { id: terminalId } = await createTerminal();

    const data = makeAgent({
      first_name: 'Ana',
      last_name: 'Silva',
      bi_number: '88888888LA88',
      genre: 'female',
      terminal_id: terminalId,
      pos_id: postId,
      phone_number: '929375582',
      training_date: new Date('2025-11-12'),
    });

    const { status } = await auth(request(app).put(`${agentURL}/${id}`)).send(data);
    expect(status).toBe(200);

    const agent = await getAgent(id);

    expect(agent.id).toBe(id);
    expect(agent.first_name).toBe('Ana');
    expect(agent.last_name).toBe('Silva');
    expect(agent.bi_number).toBe('88888888LA88');
    expect(agent.genre).toBe('female');
    expect(agent.status).toBe('active');
    expect(agent.agent_type).toBe('lotaria_nacional');
    expect(agent.terminal).toBeDefined();
    expect(agent.pos).toBeDefined();
  });

  it('should be able to delete a agent', async () => {
    const { id } = await createAgent();

    const { status } = await auth(request(app).delete(`${agentURL}/${id}`));
    expect(status).toBe(200);

    const agent = await getAgent(id);

    expect(agent.message).toBe('Agente não encontrado');
  });

  it('should be able to fetch all agents', async () => {
    await Promise.all([
      createAgent({
        first_name: 'Sebastião',
        last_name: 'Simão',
      }),
      createAgent({
        first_name: 'Délcio',
        last_name: 'Issanzo',
        agent_type: 'revendedor',
      }),
    ]);

    const response = await auth(request(app).get(`${agentURL}`));
    const agentList: Agent[] = response.body;

    expect(response.status).toBe(200);
    expect(agentList).toHaveLength(2);

    expect(agentList[0].first_name).toBe('Sebastião');
    expect(agentList[0].id_reference).toBe(9001);

    expect(agentList[1].first_name).toBe('Délcio');
    expect(agentList[1].id_reference).toBe(1001);
  });

  it('should be able to reset agent', async () => {
    const { id } = await createAgent();

    const { id: posId } = await createPos();
    const { id: terminalId } = await createTerminal();

    const data = makeAgent({
      terminal_id: terminalId,
      pos_id: posId,
    });

    await auth(request(app).put(`${agentURL}/${id}`)).send(data);

    // agent with pos and terminal
    const agent = await getAgent(id);

    expect(agent.pos).toBeDefined();
    expect(agent.terminal).toBeDefined();

    const { status, body } = await auth(request(app).put(`${agentURL}/reset/${id}`));
    expect(status).toBe(200);
    expect(body.message).toBe('Agente resetado com sucesso');

    // agent without pos and terminal
    const agentReseted = await getAgent(id);

    expect(agentReseted.pos).toBe(null);
    expect(agentReseted.terminal).toBe(null);
  });
});
