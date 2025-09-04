import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { deleteCache, RedisKeys } from '../../../utils/redis';

export async function resetSimCardService(id: string) {
  await prisma.$transaction(async (tx) => {
    const simCard = await tx.simCard.findUnique({
      where: {
        id,
      },
    });

    if (!simCard) {
      throw new NotFoundError('Sim card não encontrado ');
    }

    if (simCard.terminal_id) {
      await tx.terminal.update({
        where: {
          id: simCard.terminal_id,
        },
        data: {
          status: 'stock',
        },
      });

      await tx.simCard.update({
        where: {
          id: simCard.id,
        },
        data: {
          terminal_id: null,
        },
      });
    }
  });

  await Promise.all([
    deleteCache(RedisKeys.pos.all()),
    deleteCache(RedisKeys.agents.all()),
    deleteCache(RedisKeys.terminals.all()),
    deleteCache(RedisKeys.auditLogs.all()),

    //TODO: clear sim card cache
  ]);
}
