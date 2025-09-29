import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { BadRequestError, NotFoundError } from '../../../errors';

export async function resetTerminalService(id: string, user: AuthPayload) {
  await prisma.$transaction(async tx => {
    const terminal = await tx.terminal.findUnique({
      where: { id },
      include: { sim_card: true },
    });

    if (!terminal) {
      throw new NotFoundError('Terminal não encontrado');
    }

    if (!terminal.agent_id_reference && !terminal.sim_card) {
      throw new BadRequestError('Não há nada para resetar');
    }

    // Atualizar terminal
    const terminalUpdated = await tx.terminal.update({
      where: { id },
      data: {
        status: 'ready',
        agent_id_reference: null,
      },
    });

    // Atualizar SIM CARD (se existir)
    if (terminal.sim_card) {
      await tx.simCard.update({
        where: { id: terminal.sim_card.id },
        data: {
          status: 'stock',
          terminal_id: null,
        },
      });
    }

    // Audit log
    await audit(tx, 'RESET', {
      entity: 'TERMINAL',
      user,
      before: terminal,
      after: terminalUpdated,
      description: 'Resetou um terminal',
    });
  });
}
