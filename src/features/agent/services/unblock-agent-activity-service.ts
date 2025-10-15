import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';

async function unBlockAgentsActivitiesService(agentsIds: string[]) {
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

    await tx.agent.updateMany({
      where: {
        id_reference: { in: agentsIds.map(Number) },
      },
      data: {
        status: 'active',
      },
    });

    if (count === 0) {
      throw new NotFoundError('Nenhum agente bloqueado foi encontrado para desbloquear.');
    }

    return count;
  });

  return { updated: count };
}

export default unBlockAgentsActivitiesService;
