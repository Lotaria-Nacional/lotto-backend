import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { audit } from '../../../utils/audit-log';
import { AuthPayload } from '@lotaria-nacional/lotto';

export async function disapproveAgentService(id: string, user: AuthPayload) {
  await prisma.$transaction(async tx => {
    const agent = await tx.agent.findUnique({
      where: { id },
    });

    if (!agent) throw new NotFoundError('Agente não encontrado');

    const agentUpdated = await tx.agent.update({
      where: { id },
      data: { status: 'disapproved' },
    });

    await audit(tx, 'REPROVE', {
      user: user,
      before: agent,
      entity: 'AGENT',
      after: agentUpdated,
      description: 'Reprovou um agente',
    });
  });
}
