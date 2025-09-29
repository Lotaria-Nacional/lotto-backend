import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { AuthPayload } from '@lotaria-nacional/lotto';

export async function resetManyAgentsService(ids: string[], user: AuthPayload) {
  await prisma.$transaction(async tx => {
    for (const id of ids) {
      const agent = await tx.agent.findUnique({
        where: { id },
        include: {
          pos: { select: { id: true } },
          terminal: { select: { id: true } },
        },
      });

      if (!agent) {
        continue;
      }

      if (!agent.pos?.id && !agent.terminal?.id) {
        continue;
      }

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
      const updated = await tx.agent.update({
        where: { id },
        data: {
          status: 'approved',
        },
      });
      // Audit log individual
      await audit(tx, 'RESET', {
        user,
        before: agent,
        after: updated,
        entity: 'AGENT',
        description: `Resetou um agente`,
      });
    }
  });
}
