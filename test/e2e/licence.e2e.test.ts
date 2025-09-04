import app from '../../src';
import request from 'supertest';
import { auth } from '../utils/auth';
import { makeLicence } from '../factories/make-licence';
import { createLicence, getLicence } from '../utils/licence';
import { Licence } from '../../src/features/licence/@types/licence.t';

export const licenceURL = '/api/licences';

describe('E2E - Licence', () => {
  it('should be able to create a licence', async () => {
    const { id } = await createLicence();
    const licence = await getLicence(id);

    expect(licence.limit).toBe(2);
    expect(licence.number).toBe('numb-example');
    expect(licence.status).toBe('free');
    expect(licence.description).toBe('desc-example');
    expect(licence.emitted_at).toBe('2025-08-10T00:00:00.000Z');
  });

  it('should be able to update a licence', async () => {
    const { id } = await createLicence();

    const data = makeLicence({
      number: 'num-updated',
      description: 'desc-updated',
      emitted_at: new Date('2020-10-10'),
      expires_at: new Date('2021-10-11'),
      limit: 10,
    });

    const { status } = await auth(request(app).put(`${licenceURL}/${id}`).send(data));
    expect(status).toBe(200);

    const licence = await getLicence(id);

    expect(licence.id).toBe(id);
    expect(licence.limit).toBe(10);
    expect(licence.number).toBe('num-updated');
    expect(licence.description).toBe('desc-updated');
    expect(licence.emitted_at).toBe('2020-10-10T00:00:00.000Z');
    expect(licence.expires_at).toBe('2021-10-11T00:00:00.000Z');
  });

  it('should be able to delete a licence', async () => {
    const { id } = await createLicence();

    const { status } = await auth(request(app).delete(`${licenceURL}/${id}`));
    expect(status).toBe(200);

    const licence = await getLicence(id);
    expect(licence.message).toBe('Licença não encontrada');
  });

  it('should be able to delete many licences', async () => {
    const [pos01, pos02] = await Promise.all([createLicence(), createLicence()]);

    const data = {
      ids: [pos01.id, pos02.id],
    };

    const { status } = await auth(request(app).delete(`${licenceURL}/bulk`)).send(data);
    expect(status).toBe(200);

    const [licence01, licence02] = await Promise.all([getLicence(pos01.id), getLicence(pos02.id)]);

    expect(licence01.message).toBe('Licença não encontrada');
    expect(licence02.message).toBe('Licença não encontrada');
  });

  it('should be able to fetch all licences', async () => {
    await createLicence({ description: 'first-licence', number: 'VD01' });
    await createLicence({ description: 'second-licence', number: 'VD02' });

    const response = await auth(request(app).get(`${licenceURL}`));
    const licenceList: Licence[] = response.body;

    expect(response.status).toBe(200);
    expect(licenceList).toHaveLength(2);
    expect(licenceList).toHaveLength(2);
    expect(licenceList[0].description).toBe('first-licence');
    expect(licenceList[1].description).toBe('second-licence');
  });
});
