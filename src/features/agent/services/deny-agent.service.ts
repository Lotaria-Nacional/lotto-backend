import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { RedisKeys } from '../../../utils/redis/keys';
import { deleteCache } from '../../../utils/redis/delete-cache';

export async function denyAgentService(id: string) {
  await prisma.$transaction(async tx => {
    const agent = await tx.agent.findUnique({
      where: { id },
    });

    if (!agent) throw new NotFoundError('Agente não encontrado');

    await tx.agent.update({
      where: { id },
      data: { status: 'denied' },
    });
  });

  await Promise.all([
    deleteCache(RedisKeys.agents.all()),
    deleteCache(RedisKeys.pos.all()),
    deleteCache(RedisKeys.terminals.all()),
    deleteCache(RedisKeys.auditLogs.all()),
  ]);
}
