import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { BadRequestError } from '../../../errors';
import { AuthPayload } from '../../../@types/auth-payload';
import { deleteCache, RedisKeys } from '../../../utils/redis';

export async function deleteManyUsersService(ids: string[], user: AuthPayload) {
  await prisma.$transaction(async (tx) => {
    const { count } = await tx.user.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    if (count === 0) {
      throw new BadRequestError('Nenhum usuário foi removido');
    }

    await audit(tx, 'DELETE', {
      entity: 'USER',
      user,
      after: null,
      before: null,
    });
  });

  await Promise.all([deleteCache(RedisKeys.users.all()), deleteCache(RedisKeys.auditLogs.all())]);
}
