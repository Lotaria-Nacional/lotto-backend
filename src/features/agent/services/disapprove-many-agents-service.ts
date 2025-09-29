import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { AuthPayload } from '@lotaria-nacional/lotto';

export async function disapproveManyAgentsService(ids: string[], user: AuthPayload) {
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
        data: { status: 'disapproved' },
      });

      await audit(tx, 'REPROVE', {
        user,
        entity: 'AGENT',
        before: agent,
        after: updated,
        description: `Reprovou um agente`,
      });
    }
  });
}
