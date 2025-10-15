import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';

async function blockAgentsActivitiesService(agentsIds: string[]) {
  const count = await prisma.$transaction(async (tx) => {
    const { count } = await tx.agentActivity.updateMany({
      where: {
        id: { in: agentsIds },
        status: 'active',
      },
      data: {
        status: 'blocked',
      },
    });

    await tx.agent.updateMany({
      where: {
        id_reference: { in: agentsIds.map(Number) },
      },
      data: {
        status: 'denied',
      },
    });

    if (count === 0) {
      throw new NotFoundError('Nenhum agente ativo foi encontrado para bloquear.');
    }

    return count;
  });

  return { updated: count };
}

export default blockAgentsActivitiesService;
