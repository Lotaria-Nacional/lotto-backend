import app from '../../src';
import request from 'supertest';
import { auth } from '../utils/auth';
import { makeSimCard } from '../factories/make-sim-card';
import { createSimCard, getSimCard } from '../utils/sim-card';
import { createTerminal, getTerminal } from '../utils/terminal';

export const simCardURL = '/api/sim-cards' as const;

describe('E2E - SimCards', () => {
  it('should be able to create a simCard', async () => {
    const { id } = await createSimCard();
    const simCard = await getSimCard(id);

    expect(simCard).toBeDefined();
  });

  it('should be able to update a simCard', async () => {
    const { id } = await createSimCard();
    const { id: terminalId } = await createTerminal();

    const data = makeSimCard({
      number: '952366605',
      pin: '9999',
      puk: '9898989',
      terminal_id: terminalId,
    });

    const { status } = await auth(request(app).put(`${simCardURL}/${id}`)).send(data);
    expect(status).toBe(200);

    const simCard = await getSimCard(id);

    expect(simCard.pin).toBe(9999);
    expect(simCard.puk).toBe(9898989);
    expect(simCard.number).toBe(952366605);
    expect(simCard.terminal).toBeDefined();
    expect(simCard.terminal.status).toBe('ready');
  });

  it('should be able to delete a simCard and not fetch it', async () => {
    const { id } = await createSimCard();
    const { status } = await auth(request(app).delete(`${simCardURL}/${id}`));
    expect(status).toBe(200);

    const simCard = await getSimCard(id);
    expect(simCard.message).toBe('Sim card não encontrado');
  });

  it('should be able to delete many a simCards', async () => {
    const { id: id01 } = await createSimCard();
    const { id: id02 } = await createSimCard();

    const data = { ids: [id01, id02] };

    const { status } = await auth(request(app).delete(`${simCardURL}/bulk`)).send(data);
    expect(status).toBe(200);

    const simCard = await getSimCard(id01);
    expect(simCard.message).toBe('Sim card não encontrado');
  });

  it('should be able to fetch all simCards', async () => {
    await createSimCard();
    await createSimCard({ number: '952366605' });

    const response = await auth(request(app).get(`${simCardURL}`));

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  it('should be able to reset a simCard', async () => {
    const { id } = await createSimCard();
    const { id: terminalId } = await createTerminal();

    const data = makeSimCard({
      terminal_id: terminalId,
    });
    await auth(request(app).put(`${simCardURL}/${id}`)).send(data);

    const response = await getSimCard(id);

    expect(response.terminal.status).toBe('ready');
    expect(response.terminal).not.toBeNull();

    // RESET THE SIM CARD
    const { status, body } = await auth(request(app).put(`${simCardURL}/reset/${id}`));
    expect(status).toBe(200);

    const simCard = await getSimCard(id);
    const terminal = await getTerminal(terminalId);

    expect(simCard.terminal).toBeNull();
    expect(terminal.status).toBe('stock');
    expect(terminal.sim_card).toBeNull();
  });
});
