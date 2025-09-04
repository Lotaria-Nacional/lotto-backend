import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { RedisKeys } from '../../../utils/redis';
        
export async function resetPosService(id: string) {
  await prisma.$transaction(async (tx) => {
    const pos = await tx.pos.findUnique({
      where: {
        id,
      },
    });

    if (!pos) {
      throw new NotFoundError('POS não encontrado ');
    }

    if (pos.agent_id) {
      const agent = await tx.agent.findUnique({
        where: { id: pos.agent_id },
      });

      if (!agent) {
        throw new NotFoundError('Agente não encontrado');
      }

      await tx.agent.update({
        where: { id: pos.agent_id },
        data: {
          status: 'denied',
        },
      });
    }

    await tx.pos.update({
      where: {
        id: pos.id,
      },
      data: {
        agent_id: null,
        licence_id: null,
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
