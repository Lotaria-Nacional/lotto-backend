import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { audit } from '../../../utils/audit-log';
import { AuthPayload } from '@lotaria-nacional/lotto';

async function unBlockAgentsActivitiesService(agentsIds: string[], user: AuthPayload) {
  const updatedAgents: number[] = [];

  await prisma.$transaction(async tx => {
    for (const id of agentsIds) {
      const agent = await tx.agent.findUnique({ where: { id_reference: Number(id) } });
      if (agent && agent.status === 'denied') {
        // ou 'blocked', dependendo do status actual
        const updatedAgent = await tx.agent.update({
          where: { id_reference: Number(id) },
          data: { status: 'active' },
        });

        await audit(tx, 'ACTIVATE', {
          user,
          before: agent,
          after: updatedAgent,
          entity: 'AGENT',
          description: 'Ativou um agente',
        });

        updatedAgents.push(Number(id));
      }
    }

    if (updatedAgents.length === 0) {
      throw new NotFoundError('Nenhum agente bloqueado foi encontrado para desbloquear.');
    }

    // Opcional: atualizar agentActivity também
    await tx.agentActivity.updateMany({
      where: { id: { in: agentsIds }, status: 'blocked' },
      data: { status: 'active' },
    });
  });

  return { updated: updatedAgents.length };
}

export default unBlockAgentsActivitiesService;
