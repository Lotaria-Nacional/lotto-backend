import prisma from '../../../lib/prisma';
import { BadRequestError, NotFoundError } from '../../../errors';
import { audit } from '../../../utils/audit-log';
import { CreateLicenceDTO } from '@lotaria-nacional/lotto';
import { AuthPayload } from '../../../@types/auth-payload';

export async function createLicenceService(data: CreateLicenceDTO & { user: AuthPayload }) {
  const id = await prisma.$transaction(async (tx) => {
    const existingLicence = await prisma.licence.findUnique({
      where: { reference: data.reference },
    });

    if (existingLicence) throw new BadRequestError('Já existe uma licença com esta referência');

    const admin = await prisma.administration.findUnique({
      where: { name: data.admin_name },
      select: { name: true },
    });

    if (!admin) throw new NotFoundError('A administração não foi encontrada');

    const licenceCreated = await tx.licence.create({
      data: {
        reference: data.reference,
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
      description: 'Criou uma licença',
    });

    return licenceCreated.id;
  });

  return { id };
}
