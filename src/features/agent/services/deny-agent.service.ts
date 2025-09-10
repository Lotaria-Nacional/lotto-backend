import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { RedisKeys } from '../../../utils/redis/keys';
import { deleteCache } from '../../../utils/redis/delete-cache';
import { audit } from '../../../utils/audit-log';
import { AuthPayload } from '@lotaria-nacional/lotto';

export async function denyAgentService(id: string, user: AuthPayload) {
  await prisma.$transaction(async tx => {
    const agent = await tx.agent.findUnique({
      where: { id },
    });

    if (!agent) throw new NotFoundError('Agente não encontrado');

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
