import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { audit } from '../../../utils/audit-log';
import { RedisKeys } from '../../../utils/redis/keys';
import { AuthPayload } from '../../../@types/auth-payload';
import { deleteCache } from '../../../utils/redis/delete-cache';

export async function deleteAgentService(id: string, user: AuthPayload) {
  await prisma.$transaction(async (tx) => {
    const agent = await tx.agent.findUnique({
      where: {
        id,
      },
    });

    if (!agent) throw new NotFoundError('Agente não encontrado');

    await tx.agent.delete({
      where: { id },
    });

    await audit(tx, 'DELETE', {
      entity: 'AGENT',
      user,
      before: agent,
      after: null,
    });
  });

  // Limpa cache
  await Promise.all([
    deleteCache(RedisKeys.pos.all()),
    deleteCache(RedisKeys.agents.all()),
    deleteCache(RedisKeys.terminals.all()),
    deleteCache(RedisKeys.auditLogs.all()),
  ]);
}
