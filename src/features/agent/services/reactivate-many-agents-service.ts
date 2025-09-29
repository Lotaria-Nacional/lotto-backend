import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { AuthPayload } from '@lotaria-nacional/lotto';

export async function reactivateManyAgentsService(ids: string[], user: AuthPayload) {
  await prisma.$transaction(async tx => {
    await prisma.$transaction(async tx => {
      for (const id of ids) {
        const agent = await tx.agent.findUnique({
          where: { id },
        });

        if (!agent) {
          continue;
        }

        const updated = await tx.agent.update({
          where: { id },
          data: {
            status: 'approved',
            approved_at: new Date(),
          },
        });

        await audit(tx, 'APPROVE', {
          user,
          before: agent,
          after: updated,
          entity: 'AGENT',
          description: `Reativou um agente`,
        });
      }
    });
  });
}
