import app from '../../src';
import request from 'supertest';
import { auth } from '../utils/auth';
import { createAgent } from '../utils/agent';
import { createSimCard } from '../utils/sim-card';
import { updateTerminal } from '../factories/make-terminal';
import { createTerminal, getTerminal } from '../utils/terminal';
import { Terminal } from '../../src/features/terminal/@types/terminal.t';

export const terminalURL = '/api/terminals' as const;

describe('E2E - Terminal', () => {
  it('should be able to create a terminal and fetch it', async () => {
    const response = await createTerminal();
    const terminalId = response.id;

    const terminal = await getTerminal(terminalId);

    expect(terminal).toEqual(
      expect.objectContaining({
        id: terminalId,
        status: 'stock',
        device_id: 'device-id-example',
        serial: 'serial-number-example',
      })
    );
  });

  it('should be able to update a terminal', async () => {
    const response = await createTerminal();
    const { id: simCardId } = await createSimCard();
    const terminalId = response.id;

    const updatedTerminal = updateTerminal({
      note: 'terminal-note-example',
      leaved_at: new Date('2025-09-01'),
      sim_card_id: simCardId,
    });

    const { status } = await auth(request(app).put(`${terminalURL}/${terminalId}`)).send(updatedTerminal);
    expect(status).toBe(200);

    const terminal = await getTerminal(terminalId);

    console.log(terminal);

    expect(terminal.id).toBe(terminalId);
    expect(terminal.note).toBe('terminal-note-example');
    expect(terminal.device_id).toBe('device-id-example');
    expect(terminal.status).toBe('broken');
    expect(terminal.leaved_at).toEqual(expect.stringMatching('2025-09-01'));
  });

  it('should be able to delete a terminal and not fetch it', async () => {
    const { id } = await createTerminal();

    const response = await auth(request(app).delete(`${terminalURL}/${id}`));
    expect(response.status).toBe(200);

    const terminal = await getTerminal(id);

    expect(terminal.message).toBe('Terminal não encontrado');
  });

  it('should be able to delete many terminals', async () => {
    const { id: id01 } = await createTerminal({ serial: '1' });
    const { id: id02 } = await createTerminal({ serial: '2' });

    const data = { ids: [id01, id02] };

    const deletedRes = await auth(request(app).delete(`${terminalURL}/bulk`)).send(data);

    expect(deletedRes.status).toBe(200);

    const fetchRes = await auth(request(app).get(`${terminalURL}`));
    const fetchBody = fetchRes.body as Terminal;

    expect(fetchRes.status).toBe(200);
    expect(fetchBody).toHaveLength(0);
  });

  it('should be able to fetch all terminals', async () => {
    await createTerminal();
    await createTerminal({ serial: 'VFD952366605AE' });

    const response = await auth(request(app).get(`${terminalURL}`));

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  it('should be able to reset terminal', async () => {
    const { id } = await createTerminal();
    const { id: agentId } = await createAgent();
    const { id: simCardId } = await createSimCard();

    const data = updateTerminal({
      agent_id: agentId,
      sim_card_id: simCardId,
    });

    const updateTerminalResponse = await auth(request(app).put(`${terminalURL}/${id}`)).send(data);
    const terminal = await getTerminal(id);

    expect(terminal.agent).not.toBeNull();
    expect(terminal.sim_card).not.toBeNull();
    expect(updateTerminalResponse.status).toBe(200);
    expect(updateTerminalResponse.body.message).toBe('O terminal foi atualizado com sucesso');

    const { status, body } = await auth(request(app).put(`${terminalURL}/reset/${id}`));
    const terminalReseted = await getTerminal(id);

    expect(status).toBe(200);
    expect(body.message).toBe('O terminal foi resetado com sucesso');
    expect(terminalReseted.sim_card).toBeNull();
    expect(terminalReseted.agent).toBeNull();
  });
});
