import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { RedisKeys, deleteCache } from '../../../utils/redis';

export async function resetAgentService(id: string) {
  await prisma.$transaction(async (tx) => {
    const agent = await tx.agent.findUnique({
      where: {
        id,
      },
      include: {
        pos: { select: { id: true } },
        terminal: { select: { id: true } },
      },
    });

    if (!agent) {
      throw new NotFoundError('Agente não encontrado');
    }

    await tx.agent.update({
      where: { id },
      data: {
        ...(agent.pos?.id && { pos: { disconnect: true } }),
        ...(agent.terminal?.id && { terminal: { disconnect: true } }),
      },
    });
  });

  await Promise.all([
    deleteCache(RedisKeys.pos.all()),
    deleteCache(RedisKeys.agents.all()),
    deleteCache(RedisKeys.terminals.all()),
    deleteCache(RedisKeys.auditLogs.all()),
  ]);
}
