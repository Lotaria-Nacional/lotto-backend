import prisma from '../../../lib/prisma';
import { RedisKeys } from '../../../utils/redis/keys';
import { UpdateAgentDTO } from '@lotaria-nacional/lotto';
import { deleteCache } from '../../../utils/redis/delete-cache';
import { BadRequestError, NotFoundError } from '../../../errors';

export async function associatePosAndagentOnAgentService(data: UpdateAgentDTO) {
  await prisma.$transaction(async tx => {
    const agent = await tx.agent.findUnique({
      where: { id: data.id },
      include: {
        pos: true,
        terminal: true,
      },
    });

    if (!agent) throw new NotFoundError('agent não encontrado');

    if (data.pos_id) {
      const pos = await tx.pos.findUnique({ where: { id: data.pos_id } });
      if (!pos) throw new NotFoundError('POS não encontrado');

      if (pos.agent_id) {
        throw new BadRequestError('Este POS já está ocupado');
      }

      await tx.pos.update({
        where: {
          id: data.pos_id,
        },
        data: {
          agent_id: data.id,
          status: 'active',
        },
      });
    }

    if (data.terminal_id) {
      const terminal = await tx.terminal.findUnique({ where: { id: data.terminal_id } });

      if (!terminal) throw new NotFoundError('Terminal não encontrado');

      if (terminal.agent_id) {
        throw new BadRequestError('Este Terminal já está em uso');
      }

      await tx.terminal.update({
        where: {
          id: data.terminal_id,
        },
        data: {
          agent_id: data.id,
          status: 'on_field',
        },
      });
    }
  });

  await Promise.all([deleteCache(RedisKeys.agents.all()), deleteCache(RedisKeys.auditLogs.all())]);
}
