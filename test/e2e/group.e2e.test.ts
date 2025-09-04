import app from '../../src';
import request from 'supertest';
import { auth } from '../utils/auth';
import { makeGroup } from '../factories/make-group';
import { createGroup, getGroup } from '../utils/group';
import { Group } from '../../src/features/group/@types/group.t';

export const groupURL = '/api/groups';

describe('E2E - Group', () => {
  it('should be able to create a group', async () => {
    const { id } = await createGroup();
    const group = await getGroup(id);

    expect(group.name).toBe('Development');
    expect(group.memberships).toHaveLength(1);
  });

  it('should be able to update a group', async () => {
    const { id } = await createGroup();

    const data = makeGroup({
      name: 'T.I',
      description: 'Updated description',
      permissions: [
        {
          module: 'LICENCE',
          actions: ['READ', 'DELETE'],
        },
      ],
    });

    const { status } = await auth(request(app).put(`${groupURL}/${id}`).send(data));
    const group = await getGroup(id);

    expect(status).toBe(200);
    expect(group.name).toBe('T.I');
    expect(group.description).toBe('Updated description');
  });

  it('should be able to delete a group', async () => {
    const { id } = await createGroup();

    const { status } = await auth(request(app).delete(`${groupURL}/${id}`));
    expect(status).toBe(200);

    const group = await getGroup(id);

    expect(group.message).toBe('Grupo não encontrado');
  });

  it('should be able to fetch all groups', async () => {
    await createGroup({
      name: 'Marketing',
      description: 'Marketing group',
    });
    await createGroup({
      name: 'R.H',
      description: 'RH group',
    });

    const response = await auth(request(app).get(`${groupURL}`));
    const groupsList: Group[] = response.body;

    expect(response.status).toBe(200);
    expect(groupsList).toHaveLength(2);
    expect(groupsList[0].name).toBe('R.H');
    expect(groupsList[1].name).toBe('Marketing');
  });
});
