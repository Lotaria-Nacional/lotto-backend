import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { audit } from '../../../utils/audit-log';
import { AuthPayload } from '../../../@types/auth-payload';

export async function deleteUserService(id: string, user: AuthPayload) {
  await prisma.$transaction(async (tx) => {
    const existingUser = await tx.user.findUnique({ where: { id } });

    if (!existingUser) throw new NotFoundError('Usuário não econtrado.');

    await tx.user.delete({
      where: { id },
    });

    const { password, ...rest } = existingUser;

    await audit(tx, 'DELETE', {
      entity: 'USER',
      user,
      before: rest,
      after: null,
      description: 'Removeu um usuário',
    });
  });
}
