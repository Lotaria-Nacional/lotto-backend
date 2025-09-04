import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { audit } from '../../../utils/audit-log';
import { RedisKeys } from '../../../utils/redis/keys';
import { deleteCache } from '../../../utils/redis/delete-cache';
import { connectIfDefined } from '../../../utils/connect-disconnect';
import { CreateLicenceDTO } from '../schemas/create-licence.schema';

export async function createLicenceService(data: CreateLicenceDTO) {
  const id = await prisma.$transaction(async (tx) => {
    const admin = await prisma.administration.findUnique({
      where: { id: data.admin_id },
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
        expires_at: data.expires_at,
        file: data.file,
        limit: data.limit,
        ...connectIfDefined('admin', data.admin_id),
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

  await Promise.all([
    deleteCache(RedisKeys.pos.all()),
    deleteCache(RedisKeys.admins.all()),
    deleteCache(RedisKeys.licences.all()),
    deleteCache(RedisKeys.auditLogs.all()),
  ]);

  return { id };
}

export const makeLicenceReference = (data: Partial<CreateLicenceDTO>, admin: string) => {
  const { emitted_at, number, description } = data;
  const emitted_at_year = emitted_at?.getFullYear();

  const reference = `${admin}-N${number}-PT${description}-${emitted_at_year}`.toUpperCase();
  return { reference };
};
