import prisma from '../../../lib/prisma';
import { AuthPayload, TerminalStatus, UpdateTerminalDTO } from '@lotaria-nacional/lotto';
import { NotFoundError } from '../../../errors';
import { audit } from '../../../utils/audit-log';

export async function associateAgentAndSimCardOnTerminalService(data: UpdateTerminalDTO & { user: AuthPayload }) {
  await prisma.$transaction(async (tx) => {
    const terminal = await tx.terminal.findUnique({
      where: { id: data.id },
      include: { sim_card: true },
    });

    if (!terminal) throw new NotFoundError('Terminal não encontrado');

    let terminalUpdated;

    // 🔹 Troca de SIM card
    if (data.sim_card_id) {
      const simCard = await tx.simCard.findUnique({
        where: { id: data.sim_card_id },
      });
      if (!simCard) throw new NotFoundError('Sim Card não encontrado');

      // Desassocia sim_card antigo
      if (terminal.sim_card) {
        await tx.simCard.update({
          where: { id: terminal.sim_card.id },
          data: { terminal_id: null, status: 'stock' },
        });
      }

      // Associa o novo
      await tx.simCard.update({
        where: { id: data.sim_card_id },
        data: { status: 'active', terminal_id: data.id },
      });
    }

    // 🔹 Associação de agente
    if (data.agent_id_reference) {
      const agent = await tx.agent.findUnique({
        where: { id_reference: data.agent_id_reference },
        include: { pos: { select: { id: true } } },
      });
      if (!agent) throw new NotFoundError('Agente não encontrado');

      let newTerminalStatus: TerminalStatus = 'ready';
      let newAgentStatus = agent.status;

      if (agent.pos && agent.pos.id) {
        newTerminalStatus = 'on_field';
        newAgentStatus = 'active';
      } else {
        newTerminalStatus = 'ready';
        newAgentStatus = 'ready';
      }

      terminalUpdated = await tx.terminal.update({
        where: { id: data.id },
        data: {
          agent_id_reference: data.agent_id_reference,
          status: newTerminalStatus,
        },
      });

      await tx.agent.update({
        where: { id_reference: data.agent_id_reference },
        data: { status: newAgentStatus },
      });
    } else {
      // Só troca de SIM card, sem mexer no agente
      const status = data.sim_card_id || terminal.sim_card ? 'ready' : 'stock';

      terminalUpdated = await tx.terminal.update({
        where: { id: data.id },
        data: { status },
      });
    }

    // 🔹 Audit log
    await audit(tx, 'ASSOCIATE', {
      entity: 'TERMINAL',
      user: data.user,
      before: terminal,
      after: terminalUpdated,
    });
  });
}
