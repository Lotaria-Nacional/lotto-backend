import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { BadRequestError } from '../../../errors';
import { AuthPayload } from '../../../@types/auth-payload';

export async function deleteManyLicencesService(ids: string[], user: AuthPayload) {
  await prisma.$transaction(async tx => {
    const { count } = await tx.licence.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    if (count === 0) {
      throw new BadRequestError('As licenças não foram removidas');
    }

    await audit(tx, 'DELETE', {
      user,
      entity: 'LICENCE',
      before: null,
      after: null,
    });
  });
}
