import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { RedisKeys, deleteCache } from '../../../utils/redis';

export async function resetAgentService(id: string) {
  await prisma.$transaction(async tx => {
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

    const terminal = await tx.terminal.findUnique({
      where: { id: agent.terminal?.id },
    });

    if (!terminal) throw new NotFoundError('Terminal não encontrado');

    await tx.terminal.update({
      where: { id: terminal.id },
      data: {
        status: 'ready',
        agent_id: null,
      },
    });

    const pos = await tx.pos.findUnique({
      where: { id: agent.pos?.id },
    });

    if (!pos) throw new NotFoundError('Pos não encontrado');

    await tx.pos.update({
      where: { id: pos.id },
      data: {
        status: 'pending',
        agent_id: null,
      },
    });

    await tx.agent.update({
      where: { id },
      data: {
        status: 'approved',
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
