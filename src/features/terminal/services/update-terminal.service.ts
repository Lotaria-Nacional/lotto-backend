import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { audit } from '../../../utils/audit-log';
import { AuthPayload } from '../../../@types/auth-payload';
import { Terminal, TerminalStatus, UpdateTerminalDTO } from '@lotaria-nacional/lotto';

export async function updateTerminalService({ user, ...data }: UpdateTerminalDTO & { user: AuthPayload }) {
  await prisma.$transaction(async tx => {
    const terminal = await tx.terminal.findUnique({
      where: { id: data.id },
      include: { sim_card: true, agent: { select: { pos: true } } },
    });

    if (!terminal) throw new NotFoundError('Terminal não encontrado');

    if (data.sim_card_id) {
      const simCard = await tx.simCard.findUnique({
        where: { id: data.sim_card_id },
      });

      if (!simCard) {
        throw new NotFoundError('Sim card não encontrado');
      }
    }

    if (data.agent_id) {
      const agent = await tx.agent.findUnique({
        where: { id: data.agent_id },
      });

      if (!agent) {
        throw new NotFoundError('Agent não encontrado');
      }
    }

    const status = getTerminalStatus(data, terminal);

    const updated = await tx.terminal.update({
      where: { id: data.id },
      data: {
        ...data,
        status,
        note: data.note,
        leaved_at: data.leaved_at,
        agent_id: status === 'broken' ? null : terminal.agent_id,
      },
    });

    await audit(tx, 'UPDATE', {
      user,
      entity: 'TERMINAL',
      before: terminal,
      after: updated,
    });
  });
}

const getTerminalStatus = (data: Omit<UpdateTerminalDTO, 'user'>, terminal: any): TerminalStatus => {
  if (data.note) return 'broken';
  if ((terminal as Terminal).agent?.pos?.id) return 'on_field';
  if (data.sim_card_id) return 'ready';
  return 'stock';
};
