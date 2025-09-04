import { NotFoundError } from '../../../errors';
import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { deleteCache } from '../../../utils/redis/delete-cache';
import { RedisKeys } from '../../../utils/redis/keys';
import { UpdateUserDTO } from '../schemas/update-user.schema';

export async function updateUserService({ user, ...data }: UpdateUserDTO) {
  const existingUser = await prisma.user.findUnique({ where: { id: data.id } });

  if (!existingUser) throw new NotFoundError('Usuário não encontrado.');

  await prisma.$transaction(async (tx) => {
    const updatedUser = await prisma.user.update({
      where: { id: data.id },
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
      },
    });

    await audit(tx, 'UPDATE', {
      entity: 'USER',
      user,
      before: existingUser,
      after: updatedUser,
    });
  });

  await Promise.all([deleteCache(RedisKeys.users.all()), deleteCache(RedisKeys.auditLogs.all())]);
}
