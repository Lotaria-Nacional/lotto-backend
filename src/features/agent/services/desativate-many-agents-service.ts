import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { AuthPayload } from '@lotaria-nacional/lotto';

export async function desativateManyAgentsService(ids: string[], user: AuthPayload) {
  await prisma.$transaction(async tx => {
    // Atualizar os terminais e POS de cada agente
    for (const id of ids) {
      const agent = await tx.agent.findUnique({
        where: { id },
        include: {
          terminal: true,
          pos: true,
        },
      });

      if (!agent) {
        continue; // não interrompe o loop
      }

      if (agent.terminal) {
        await tx.terminal.update({
          where: { id: agent.terminal.id },
          data: { agent_id_reference: null },
        });
      }

      if (agent.pos) {
        await tx.pos.update({
          where: { id: agent.pos.id },
          data: {
            agent_id_reference: null,
            status: 'pending',
          },
        });
      }
      // Atualiza todos os agentes
      const updated = await tx.agent.update({
        where: { id },
        data: { status: 'denied' },
      });

      await audit(tx, 'REPROVE', {
        user,
        before: agent,
        after: updated,
        entity: 'AGENT',
        description: `Desativou um agente`,
      });
    }
  });
}
