import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { RedisKeys } from '../../../utils/redis/keys';
import { CreateAgentDTO } from '@lotaria-nacional/lotto';
import { AuthPayload } from '../../../@types/auth-payload';
import { deleteCache } from '../../../utils/redis/delete-cache';

export async function createAgentService({ user, ...data }: CreateAgentDTO & { user: AuthPayload }) {
  const id = await prisma.$transaction(async tx => {
    const { counter } = await tx.idReference.update({
      where: { type: data.type },
      data: { counter: { increment: 1 } },
    });

    let agent = await tx.agent.create({
      data: {
        id_reference: counter,
        agent_type: data.type,
        first_name: data.first_name,
        last_name: data.last_name,
        bi_number: data.bi_number,
        genre: data.genre,
        phone_number: data.phone_number,
        training_date: data.training_date,
      },
    });

    // Auditoria
    await audit(tx, 'CREATE', {
      user,
      before: null,
      after: agent,
      entity: 'AGENT',
    });

    return agent.id;
  });

  // Limpa cache
  await Promise.all([
    deleteCache(RedisKeys.pos.all()),
    deleteCache(RedisKeys.agents.all()),
    deleteCache(RedisKeys.terminals.all()),
    deleteCache(RedisKeys.auditLogs.all()),
  ]);

  return { id };
}
