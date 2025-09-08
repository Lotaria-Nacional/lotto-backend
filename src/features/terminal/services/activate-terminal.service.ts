import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { RedisKeys } from '../../../utils/redis/keys';
import { deleteCache } from '../../../utils/redis/delete-cache';

export async function activateTerminalService(id: string) {
  await prisma.$transaction(async tx => {
    const terminal = await tx.terminal.findUnique({
      where: { id },
    });

    if (!terminal) throw new NotFoundError('Terminal não encontrado');

    await tx.terminal.update({
      where: { id },
      data: {
        status: 'ready',
      },
    });
  });

  const promises = [deleteCache(RedisKeys.terminals.all()), deleteCache(RedisKeys.auditLogs.all())];

  await Promise.all(promises);
}
