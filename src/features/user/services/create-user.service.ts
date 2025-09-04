import bcrypt from 'bcrypt';
import prisma from '../../../lib/prisma';
import { ConflictError } from '../../../errors';
import { audit } from '../../../utils/audit-log';
import { RedisKeys } from '../../../utils/redis/keys';
import { CreateUserDTO } from '../schemas/create-user.schema';
import { deleteCache } from '../../../utils/redis/delete-cache';

export async function createUserService({ user, ...data }: CreateUserDTO) {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });

  if (existingUser) throw new ConflictError('Já existe um usuário com este email.');

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = await bcrypt.hash(data.password, salt);

  await prisma.$transaction(async (tx) => {
    const userCreated = await tx.user.create({
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: hashedPassword,
      },
    });

    await audit(tx, 'CREATE', {
      entity: 'USER',
      user,
      before: null,
      after: userCreated,
    });
  });

  await Promise.all([deleteCache(RedisKeys.users.all()), deleteCache(RedisKeys.auditLogs.all())]);
}
