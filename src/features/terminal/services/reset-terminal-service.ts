import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { deleteCache, RedisKeys } from '../../../utils/redis';

export async function resetTerminalService(id: string) {
  await prisma.$transaction(async tx => {
    const terminal = await tx.terminal.findUnique({
      where: {
        id,
      },
    });

    if (!terminal) {
      throw new NotFoundError('Terminal não encontrado ');
    }

    await tx.terminal.update({
      where: {
        id: terminal.id,
      },
      data: {
        status: 'stock',
        agent_id: null,
        sim_card: { disconnect: true },
      },
    });
  });

  await Promise.all([
    deleteCache(RedisKeys.pos.all()),
    deleteCache(RedisKeys.agents.all()),
    deleteCache(RedisKeys.auditLogs.all()),
    deleteCache(RedisKeys.terminals.all()),

    //TODO: clear sim card cache
  ]);
}
