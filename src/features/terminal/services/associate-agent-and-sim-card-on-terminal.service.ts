import prisma from '../../../lib/prisma';
import { AuthPayload, UpdateTerminalDTO } from '@lotaria-nacional/lotto';
import { NotFoundError } from '../../../errors';
import { audit } from '../../../utils/audit-log';

export async function associateAgentAndSimCardOnTerminalService(data: UpdateTerminalDTO & { user: AuthPayload }) {
  await prisma.$transaction(async tx => {
    const terminal = await tx.terminal.findUnique({ where: { id: data.id }, include: { sim_card: true } });

    if (!terminal) throw new NotFoundError('Terminal não encontrado');
    let terminalUpdated;

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
      const agent = await tx.agent.findUnique({ where: { id: data.agent_id } });

      if (!agent) throw new NotFoundError('Agente não encontrado');

      terminalUpdated = await tx.terminal.update({
        where: { id: data.id },
        data: {
          agent_id: null,
          status: 'on_field',
        },
      });

      if (terminal.agent_id !== data.agent_id) {
        await tx.agent.update({
          where: { id: data.agent_id },
          data: {
            terminal: { connect: { id: data.id } },
          },
        });
      }
    }

    await audit(tx, 'ASSOCIATE', {
      entity: 'TERMINAL',
      user: data.user,
      before: terminal,
      after: terminalUpdated,
    });
  });
}
