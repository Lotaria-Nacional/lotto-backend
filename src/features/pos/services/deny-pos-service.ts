import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { RedisKeys } from '../../../utils/redis';

export async function denyPosService(id: string) {
  await prisma.$transaction(async tx => {
    const pos = await tx.pos.findUnique({
      where: {
        id,
      },
    });

    if (!pos) {
      throw new NotFoundError('POS não encontrado ');
    }

    await tx.pos.update({
      where: {
        id: pos.id,
      },
      data: {
        status: 'denied',
      },
    });
  });

  await Promise.all([
    RedisKeys.pos.all(),
    RedisKeys.agents.all(),
    RedisKeys.terminals.all(),
    RedisKeys.auditLogs.all(),
  ]);
}
