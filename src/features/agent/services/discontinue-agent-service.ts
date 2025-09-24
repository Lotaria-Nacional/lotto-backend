import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { audit } from '../../../utils/audit-log';
import { AuthPayload } from '@lotaria-nacional/lotto';

export async function discontinueAgentService(id: string, user: AuthPayload) {
  await prisma.$transaction(async (tx) => {
    const agent = await tx.agent.findUnique({
      where: { id },
      include: {
        pos: { select: { id: true } },
        terminal: { select: { id: true } },
      },
    });

    if (!agent) throw new NotFoundError('Agente não encontrado');

    // Resetar TERMINAL (se existir)
    if (agent.terminal?.id) {
      await tx.terminal.update({
        where: { id: agent.terminal.id },
        data: {
          status: 'ready',
          agent_id_reference: null,
        },
      });
    }

    // Resetar POS (se existir)
    if (agent.pos?.id) {
      await tx.pos.update({
        where: { id: agent.pos.id },
        data: {
          status: 'approved',
          agent_id_reference: null,
        },
      });
    }

    // Atualizar AGENTE
    const agentUpdated = await tx.agent.update({
      where: { id },
      data: {
        status: 'discontinued',
      },
    });

    // Audit log
    await audit(tx, 'DISCONTINUE', {
      user,
      before: agent,
      after: agentUpdated,
      entity: 'AGENT',
      description: `Descontinuou um agente`,
    });
  });
}
