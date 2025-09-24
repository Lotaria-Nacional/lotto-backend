import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { audit } from '../../../utils/audit-log';
import { AuthPayload } from '@lotaria-nacional/lotto';

export async function resetSimCardService(id: string, user: AuthPayload) {
  await prisma.$transaction(async (tx) => {
    const simCard = await tx.simCard.findUnique({
      where: {
        id,
      },
    });

    if (!simCard) {
      throw new NotFoundError('Sim card não encontrado ');
    }
    let simCardUpdated;

    if (simCard.terminal_id) {
      await tx.terminal.update({
        where: {
          id: simCard.terminal_id,
        },
        data: {
          status: 'stock',
        },
      });

      simCardUpdated = await tx.simCard.update({
        where: {
          id: simCard.id,
        },
        data: {
          terminal_id: null,
        },
      });
    }

    await audit(tx, 'RESET', {
      entity: 'SIM_CARD',
      user: user,
      after: simCard,
      before: simCardUpdated,
      description: 'Resetou um sim card',
    });
  });
}
