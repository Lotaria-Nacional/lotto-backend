import prisma from '../../../lib/prisma';
import { RedisKeys } from '../../../utils/redis/keys';
import { UpdateTerminalDTO } from '@lotaria-nacional/lotto';
import { deleteCache } from '../../../utils/redis/delete-cache';
import { BadRequestError, NotFoundError } from '../../../errors';

export async function associateAgentAndSimCardOnTerminalService(data: UpdateTerminalDTO) {
  await prisma.$transaction(async tx => {
    const terminal = await tx.terminal.findUnique({ where: { id: data.id }, include: { sim_card: true } });

    if (!terminal) throw new NotFoundError('Terminal não encontrado');

    if (data.sim_card_id) {
      const simCard = await tx.simCard.findUnique({ where: { id: data.sim_card_id } });
      if (!simCard) throw new NotFoundError('Sim Card não encontrado');

      if (terminal.sim_card) {
        await tx.simCard.update({
          where: { id: terminal.sim_card.id },
          data: { terminal_id: null },
        });
      }

      await tx.simCard.update({
        where: { id: data.sim_card_id },
        data: { status: 'active', terminal_id: data.id },
      });
    }

    if (data.agent_id) {
      if (terminal.agent_id && terminal.agent_id !== data.agent_id) {
        throw new BadRequestError('Este terminal já está a ser usado por outro agente');
      }

      const agent = await tx.agent.findUnique({ where: { id: data.agent_id } });

      if (!agent) throw new NotFoundError('Agente não encontrado');

      if (terminal.agent_id !== data.agent_id) {
        await tx.agent.update({
          where: { id: data.agent_id },
          data: {
            terminal: { connect: { id: data.id } },
          },
        });
      }
    }
  });

  await Promise.all([deleteCache(RedisKeys.terminals.all()), deleteCache(RedisKeys.auditLogs.all())]);
}
