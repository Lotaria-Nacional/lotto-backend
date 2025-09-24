import prisma from '../../../lib/prisma';
import { BadRequestError } from '../../../errors';
import { audit } from '../../../utils/audit-log';
import { AuthPayload } from '../../../@types/auth-payload';

export async function deleteManyPosService(ids: string[], user: AuthPayload) {
  await prisma.$transaction(async tx => {
    const { count } = await tx.pos.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    if (count === 0) {
      throw new BadRequestError('Pos não removidos');
    }

    await audit(tx, 'DELETE', {
      user,
      entity: 'POS',
      before: null,
      after: null,
    });
  });
}
