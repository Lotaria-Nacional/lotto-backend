import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { BadRequestError, NotFoundError } from '../../../errors';
import { AuthPayload, UpdateTerminalDTO } from '@lotaria-nacional/lotto';

export async function associateSimCardOnTerminalService(data: UpdateTerminalDTO & { user: AuthPayload }) {
  if (!data.sim_card_id) throw new BadRequestError('Nenhum SIM card foi atribuído');

  await prisma.$transaction(async (tx) => {
    const terminal = await tx.terminal.findUnique({
      where: { id: data.id },
      include: { sim_card: true },
    });

    if (!terminal) throw new NotFoundError('Terminal não encontrado');

    let terminalUpdated;

    // Troca de SIM card
    if (data.sim_card_id) {
      const simCard = await tx.simCard.findUnique({
        where: { id: data.sim_card_id },
      });
      if (!simCard) throw new NotFoundError('Sim Card não encontrado');

      // Desassocia sim_card antigo
      if (terminal.sim_card) {
        await tx.simCard.update({
          where: { id: terminal.sim_card.id },
          data: { terminal_id: null, status: 'stock' },
        });
      }

      // Associa o novo //
      await tx.simCard.update({
        where: { id: data.sim_card_id },
        data: { status: 'stock', terminal_id: data.id },
      });
    }

    // Terminal sempre fica "ready" se tiver SIM card
    terminalUpdated = await tx.terminal.update({
      where: { id: data.id },
      data: {
        status: 'ready',
      },
      include: {
        sim_card: true,
      },
    });

    const after: any = {
      ...terminalUpdated,
      sim_card: terminalUpdated.sim_card?.number ?? null,
    };
    // Audit log
    await audit(tx, 'ASSOCIATE', {
      entity: 'TERMINAL',
      user: data.user,
      before: terminal,
      after,
      description: 'Atribuiu um sim card a uma Máquina Sunmi v2',
    });
  });
}
