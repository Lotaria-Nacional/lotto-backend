import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { audit } from '../../../utils/audit-log';
import { CreateLicenceDTO } from '@lotaria-nacional/lotto';
import { AuthPayload } from '../../../@types/auth-payload';
import { makeLicenceReference } from '../utils/make-licence-reference';

export async function createLicenceService(data: CreateLicenceDTO & { user: AuthPayload }) {
  const id = await prisma.$transaction(async (tx) => {
    const admin = await prisma.administration.findUnique({
      where: { name: data.admin_name },
      select: { name: true },
    });

    if (!admin) throw new NotFoundError('A administração não foi encontrada');

    const { reference } = makeLicenceReference(data, admin.name);

    const licenceCreated = await tx.licence.create({
      data: {
        reference,
        number: data.number,
        description: data.description,
        emitted_at: data.emitted_at,
        coordinates: data.coordinates,
        latitude: data.latitude!,
        longitude: data.longitude!,
        expires_at: data.expires_at,
        limit: data.limit,
        admin_name: data.admin_name,
      },
    });

    await audit(tx, 'CREATE', {
      user: data.user,
      entity: 'LICENCE',
      before: null,
      after: licenceCreated,
    });

    return licenceCreated.id;
  });

  return { id };
}
