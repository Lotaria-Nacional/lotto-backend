import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { audit } from '../../../utils/audit-log';
import { AuthPayload, UpdateAgentDTO } from '@lotaria-nacional/lotto';

export async function reScheduleTrainingService(data: UpdateAgentDTO, user: AuthPayload) {
  await prisma.$transaction(async tx => {
    const agent = await prisma.agent.findUnique({
      where: {
        id: data.id,
      },
    });

    if (!agent) {
      throw new NotFoundError('Agente não encontrado.');
    }

    const agentUpdated = await prisma.agent.update({
      where: {
        id: data.id,
      },
      data: {
        training_date: data.training_date,
        status: 'scheduled',
      },
    });

    await audit(tx, 'RESCHEDULE', {
      user,
      before: agent,
      after: agentUpdated,
      entity: 'AGENT',
      description: `Re-agendou a formação do agente`,
    });
  });
}
