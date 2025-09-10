import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { audit } from '../../../utils/audit-log';
import { UpdateUserDTO } from '../schemas/update-user.schema';

export async function updateUserService(data: UpdateUserDTO) {
  const user = await prisma.user.findUnique({ where: { id: data.id } });

  if (!user) throw new NotFoundError('Usuário não encontrado.');

  await prisma.$transaction(async tx => {
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
      user: data.user,
      before: user,
      after: updatedUser,
    });
  });
}
