import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { audit } from '../../../utils/audit-log';
import { AuthPayload } from '@lotaria-nacional/lotto';

export async function reactivatePosService(id: string, user: AuthPayload) {
  await prisma.$transaction(async tx => {
    const pos = await tx.pos.findUnique({
      where: {
        id,
      },
    });

    if (!pos) {
      throw new NotFoundError('POS não encontrado');
    }

    const posUpdated = await tx.pos.update({
      where: {
        id,
      },
      data: {
        status: 'approved',
      },
    });

    await audit(tx, 'APPROVE', {
      user: user,
      entity: 'POS',
      before: pos,
      after: posUpdated,
      description: `Reativou um ponto de venda`,
    });
  });
}
