import prisma from '../../../lib/prisma';
import { BadRequestError, NotFoundError } from '../../../errors';
import { audit } from '../../../utils/audit-log';
import { AuthPayload } from '@lotaria-nacional/lotto';

export async function resetTerminalService(id: string, user: AuthPayload) {
  await prisma.$transaction(async tx => {
    const terminal = await tx.terminal.findUnique({
      where: {
        id,
      },
      include: { sim_card: true },
    });

    if (!terminal) {
      throw new NotFoundError('Terminal não encontrado ');
    }

    if (!terminal.agent_id && !terminal.sim_card) {
      throw new BadRequestError('Não há nada para resetar');
    }

    const terminalUpdated = await tx.terminal.update({
      where: {
        id: terminal.id,
      },
      data: {
        status: 'stock',
        agent_id: null,
        sim_card: { disconnect: true },
      },
    });

    await audit(tx, 'RESET', {
      entity: 'TERMINAL',
      user: user,
      before: terminal,
      after: terminalUpdated,
    });
  });
}
