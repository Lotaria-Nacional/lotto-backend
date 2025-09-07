import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { audit } from '../../../utils/audit-log';
import { RedisKeys } from '../../../utils/redis/keys';
import { UpdateLicenceDTO } from '@lotaria-nacional/lotto';
import { AuthPayload } from '../../../@types/auth-payload';
import { deleteCache } from '../../../utils/redis/delete-cache';
import { makeLicenceReference } from './create-licence.service';
import { connectOrDisconnect } from '../../../utils/connect-disconnect';

export async function updateLicenceService(data: UpdateLicenceDTO & { user: AuthPayload }) {
  await prisma.$transaction(async tx => {
    const licence = await tx.licence.findUnique({
      where: { id: data.id },
    });

    if (!licence) throw new NotFoundError('Licença não encontrada');

    const admin = await tx.administration.findUnique({
      where: { id: data.admin_id },
    });

    if (!admin) throw new NotFoundError('Administração não encontrada');

    const { reference } = makeLicenceReference(data, admin.name);

    const licenceUpdated = await tx.licence.update({
      where: { id: data.id },
      data: {
        reference,
        number: data.number,
        description: data.description,
        emitted_at: data.emitted_at,
        expires_at: data.expires_at,
        limit: data.limit,
        ...connectOrDisconnect('admin', data.admin_id),
      },
      include: { admin: { select: { id: true, name: true } } },
    });

    await audit(tx, 'UPDATE', {
      user: data.user,
      entity: 'LICENCE',
      before: licence,
      after: licenceUpdated,
    });
  });

  await Promise.all([
    deleteCache(RedisKeys.pos.all()),
    deleteCache(RedisKeys.admins.all()),
    deleteCache(RedisKeys.licences.all()),
    deleteCache(RedisKeys.auditLogs.all()),
  ]);
}
