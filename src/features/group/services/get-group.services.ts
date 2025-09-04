import { NotFoundError } from '../../../errors';
import prisma from '../../../lib/prisma';

export async function getGroupService(id: string) {
  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      memberships: {
        select: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              role: true,
              email: true,
            },
          },
        },
      },
      permissions: {
        select: {
          action: true,
          module: true,
        },
      },
    },
  });

  if (!group) {
    throw new NotFoundError('Grupo não encontrado');
  }

  return group;
}
