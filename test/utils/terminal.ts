import app from '../../src';
import { auth } from './auth';
import request from 'supertest';
import { makeTerminal } from '../factories/make-terminal';
import { CreateTerminalDTO } from '../../src/features/terminal/schemas/create-terminal.schema';
import { Terminal } from '../../src/features/terminal/@types/terminal.t';

export async function createTerminal(data?: Partial<CreateTerminalDTO>) {
  const terminal = makeTerminal(data);
  const res = await auth(request(app).post('/api/terminals')).send(terminal);
  expect(res.status).toBe(201);

  return res.body as Terminal;
}

export async function getTerminal(id: string) {
  const response = await auth(request(app).get(`/api/terminals/${id}`));
  return response.body as Terminal & { message: string };
}
