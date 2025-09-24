import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { audit } from '../../../utils/audit-log';
import { AuthPayload } from '../../../@types/auth-payload';

export async function deleteLicenceService(id: string, user: AuthPayload) {
  await prisma.$transaction(async tx => {
    const licence = await tx.licence.findUnique({
      where: { id },
    });

    if (!licence) throw new NotFoundError('Licença não encontrada');

    await tx.licence.delete({ where: { id } });

    await audit(tx, 'DELETE', {
      user,
      entity: 'LICENCE',
      before: licence,
      after: null,
    });
  });
}
