import prisma from '../../../lib/prisma';
import { RedisKeys } from '../../../utils/redis/keys';
import { deleteCache } from '../../../utils/redis/delete-cache';
import { BadRequestError } from '../../../errors';

export async function deleteManyTerminalService(ids: string[]) {
  await prisma.$transaction(async tx => {
    const { count } = await tx.terminal.deleteMany({
      where: { id: { in: ids } },
    });

    if (count === 0) {
      throw new BadRequestError('Nenhum terminal foi deletado');
    }
  });

  await Promise.all([deleteCache(RedisKeys.terminals.all()), deleteCache(RedisKeys.agents.all())]);
}
