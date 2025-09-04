import prisma from '../../../lib/prisma';
import { BadRequestError } from '../../../errors';
import { audit } from '../../../utils/audit-log';
import { RedisKeys } from '../../../utils/redis/keys';
import { AuthPayload } from '../../../@types/auth-payload';
import { deleteCache } from '../../../utils/redis/delete-cache';

export async function deleteManyPosService(ids: string[], user: AuthPayload) {
  await prisma.$transaction(async (tx) => {
    const { count } = await tx.pos.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    if (count === 0) {
      throw new BadRequestError('Pos não removidos');
    }

    await audit(tx, 'DELETE', {
      user,
      entity: 'POS',
      before: null,
      after: null,
    });
  });

  // Limpa os caches
  await Promise.all([
    deleteCache(RedisKeys.pos.all()),
    deleteCache(RedisKeys.admins.all()),
    deleteCache(RedisKeys.agents.all()),
    deleteCache(RedisKeys.licences.all()),
    deleteCache(RedisKeys.auditLogs.all()),
  ]);
}
