import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { audit } from '../../../utils/audit-log';
import { UpdateSimCardDTO } from '@lotaria-nacional/lotto';
import { AuthPayload } from '../../../@types/auth-payload';

export async function updateSimCardService({ user, ...data }: UpdateSimCardDTO & { user: AuthPayload }) {
  await prisma.$transaction(async (tx) => {
    const simCard = await tx.simCard.findUnique({
      where: {
        id: data.id,
      },
    });

    if (!simCard) {
      throw new NotFoundError('Sim card não encontrado');
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

      await tx.terminal.update({
        where: { id: data.terminal_id },
        data: {
          status: 'ready',
        },
      });
    }

    const updated = await tx.simCard.update({
      where: {
        id: data.id,
      },
      data: {
        ...data,
        terminal_id: data.terminal_id,
      },
    });

    await audit(tx, 'UPDATE', {
      entity: 'SIM_CARD',
      user: user,
      before: simCard,
      after: updated,
    });
  });
}
