import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { audit } from '../../../utils/audit-log';
import { AuthPayload } from '@lotaria-nacional/lotto';

export async function approveAgentService(id: string, user: AuthPayload) {
  await prisma.$transaction(async (tx) => {
    const agent = await tx.agent.findUnique({
      where: { id },
    });

    if (!agent) throw new NotFoundError('Agente não encontrado');

    const agentApproved = await tx.agent.update({
      where: { id },
      data: { status: 'approved' },
    });

    await audit(tx, 'APPROVE', {
      user,
      before: agent,
      after: agentApproved,
      entity: 'AGENT',
    });
  });
}
