import bcrypt from 'bcrypt';
import prisma from '../../../lib/prisma';
import { ConflictError } from '../../../errors';
import { audit } from '../../../utils/audit-log';
import { CreateUserDTO } from '../schemas/create-user.schema';

export async function createUserService({ user, ...data }: CreateUserDTO) {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });

  if (existingUser) throw new ConflictError('Já existe um usuário com este email.');

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = await bcrypt.hash(data.password, salt);

  await prisma.$transaction(async tx => {
    const userCreated = await tx.user.create({
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: hashedPassword,
      },
    });

    const group = await tx.group.findFirst({
      where: {
        name: 'Pendentes',
      },
    });

    if (group) {
      await tx.membership.create({
        data: {
          user_id: userCreated.id,
          group_id: group.id,
        },
      });
    }

    await audit(tx, 'CREATE', {
      entity: 'USER',
      user,
      before: null,
      after: userCreated,
      description: 'Criou um usuário',
    });
  });
}
