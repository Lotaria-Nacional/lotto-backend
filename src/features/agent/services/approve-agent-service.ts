import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { NotFoundError } from '../../../errors';
import { AuthPayload } from '@lotaria-nacional/lotto';

export async function approveAgentService(id: string, user: AuthPayload) {
  await prisma.$transaction(async tx => {
    const agent = await tx.agent.findUnique({
      where: { id },
    });

    if (!agent) throw new NotFoundError('Agente não encontrado');

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
  });
}
