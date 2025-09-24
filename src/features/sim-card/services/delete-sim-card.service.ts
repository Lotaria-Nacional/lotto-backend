import { SimCard } from './../@types/sim-card.t';
import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { audit } from '../../../utils/audit-log';
import { AuthPayload } from '@lotaria-nacional/lotto';

export async function deleteSimCardService(id: string, user: AuthPayload) {
  const simCardId = await prisma.$transaction(async (tx) => {
    const simCard = await tx.simCard.findUnique({
      where: {
        id,
      },
    });

    if (!simCard) throw new NotFoundError('Sim card não encontrado');

    await tx.simCard.delete({
      where: {
        id,
      },
    });

    await audit(tx, 'DELETE', {
      user,
      entity: 'SIM_CARD',
      before: simCard,
      after: null,
      description: 'Removeu um sim card do inventário',
    });
    return id;
  });

  return { id: simCardId };
}
