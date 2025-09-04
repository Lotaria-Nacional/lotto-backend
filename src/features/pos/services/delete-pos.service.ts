import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { audit } from '../../../utils/audit-log';
import { RedisKeys } from '../../../utils/redis/keys';
import { AuthPayload } from '../../../@types/auth-payload';
import { deleteCache } from '../../../utils/redis/delete-cache';

export async function deletePosService(id: string, user: AuthPayload) {
  await prisma.$transaction(async (tx) => {
    const pos = await tx.pos.findUnique({ where: { id } });

    if (!pos) throw new NotFoundError(`O POS não foi encontrado.`);

    await tx.pos.delete({ where: { id } });

    await audit(tx, 'DELETE', {
      user,
      entity: 'POS',
      before: pos,
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
