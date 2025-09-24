import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { audit } from '../../../utils/audit-log';
import { AuthPayload } from '../../../@types/auth-payload';
import { connectOrDisconnect } from '../../../utils/connect-disconnect';
import { AgentStatus, UpdateAgentDTO } from '@lotaria-nacional/lotto';

export async function updateAgentService({ user, ...data }: UpdateAgentDTO & { user: AuthPayload }) {
  await prisma.$transaction(async (tx) => {
    const agent = await tx.agent.findUnique({
      where: {
        id: data.id,
      },
    });

    if (!agent) throw new NotFoundError('Agente não encontrado');

    let status: AgentStatus = agent.status;

    if (data.pos_id) {
      const pos = await tx.pos.findUnique({
        where: {
          id: data.pos_id,
        },
      });

      if (!pos) {
        throw new NotFoundError('POS não encontrado');
      }

      status = 'active';
    }

    if (data.terminal_id) {
      const terminal = await tx.terminal.findUnique({
        where: {
          id: data.terminal_id,
        },
      });

      if (!terminal) {
        throw new NotFoundError('Terminal não encontrado');
      }
    }

    if (data.training_date) {
      status = 'scheduled';
    }

    const updated = await tx.agent.update({
      where: { id: data.id },
      data: {
        status,
        first_name: data.first_name,
        last_name: data.last_name,
        bi_number: data.bi_number,
        genre: data.genre,
        phone_number: data.phone_number,
        training_date: data.training_date,
        ...connectOrDisconnect('pos', data.pos_id),
        ...connectOrDisconnect('terminal', data.terminal_id),
      },
    });

    await audit(tx, 'UPDATE', {
      user,
      entity: 'AGENT',
      before: agent,
      after: updated,
      description: `Atualizou os dados do agente ${updated.id_reference}`,
    });
  });
}
