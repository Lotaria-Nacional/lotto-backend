import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { RedisKeys } from '../../../utils/redis/keys';
import { deleteCache } from '../../../utils/redis/delete-cache';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { audit } from '../../../utils/audit-log';

export async function desativateAgentService(id: string, user: AuthPayload) {
  await prisma.$transaction(async tx => {
    const agent = await tx.agent.findUnique({
      where: { id },
      include: {
        terminal: true,
        pos: true,
      },
    });

    if (!agent) throw new NotFoundError('Agente não encontrado');

    if (agent.terminal) {
      const terminal = await tx.terminal.findUnique({
        where: { id: agent.terminal.id },
      });
      if (!terminal) throw new NotFoundError('Terminal não encontrado');

      await tx.terminal.update({
        where: { id: agent.terminal.id },
        data: {
          agent_id: null,
        },
      });
    }

    if (agent.pos) {
      const pos = await tx.pos.findUnique({
        where: { id: agent.pos.id },
      });
      if (!pos) throw new NotFoundError('Pos não encontrado');

      await tx.pos.update({
        where: { id: agent.pos.id },
        data: {
          agent_id_reference: null,
          status: 'pending',
        },
      });
    }

    const agentUpdated = await tx.agent.update({
      where: { id },
      data: { status: 'denied' },
    });

    await audit(tx, 'REPROVE', {
      user: user,
      before: agent,
      after: agentUpdated,
      entity: 'AGENT',
    });
  });

  await Promise.all([
    deleteCache(RedisKeys.agents.all()),
    deleteCache(RedisKeys.pos.all()),
    deleteCache(RedisKeys.terminals.all()),
    deleteCache(RedisKeys.auditLogs.all()),
  ]);
}
