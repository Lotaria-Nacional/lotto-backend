import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { AuthPayload } from '@lotaria-nacional/lotto';

export async function approveManyAgentsService(ids: string[], user: AuthPayload) {
  await prisma.$transaction(async tx => {
    for (const id of ids) {
      const agent = await tx.agent.findUnique({
        where: { id },
      });

      if (!agent) {
        // só continua para o próximo
        continue;
      }
      const agentApproved = await tx.agent.update({
        where: { id },
        data: {
          status: 'approved',
          approved_at: new Date(),
        },
      });

      await audit(tx, 'APPROVE', {
        user,
        before: agent,
        after: agentApproved,
        entity: 'AGENT',
        description: `Aprovou um agente`,
      });
    }
  });
}
