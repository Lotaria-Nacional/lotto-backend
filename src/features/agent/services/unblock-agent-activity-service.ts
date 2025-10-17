import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { audit } from '../../../utils/audit-log';
import { AuthPayload } from '@lotaria-nacional/lotto';

async function unBlockAgentsActivitiesService(agentsIds: string[], user: AuthPayload) {
  const count = await prisma.$transaction(async (tx) => {
    const { count } = await tx.agentActivity.updateMany({
      where: {
        id: { in: agentsIds },
        status: 'blocked',
      },
      data: {
        status: 'active',
      },
    });

    for (const id of agentsIds) {
      const agent = await tx.agent.findUnique({ where: { id_reference: Number(id) } });
      if (agent) {
        const updatedAgent = await tx.agent.update({
          where: {
            id_reference: Number(id),
          },
          data: { status: 'active' },
        });

        await audit(tx, 'ACTIVATE', {
          user,
          before: agent,
          after: updatedAgent,
          entity: 'AGENT',
          description: 'Ativou um agente',
        });
      }
    }

    if (count === 0) {
      throw new NotFoundError('Nenhum agente bloqueado foi encontrado para ativar.');
    }

    return count;
  });

  return { updated: count };
}

export default unBlockAgentsActivitiesService;
