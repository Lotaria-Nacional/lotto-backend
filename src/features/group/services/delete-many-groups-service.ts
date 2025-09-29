import { NotFoundError } from '../../../errors';
import prisma from '../../../lib/prisma';

export async function deleteManyGroupsService(ids: string[]) {
  const [_, __, { count }] = await prisma.$transaction([
    prisma.membership.deleteMany({
      where: { group_id: { in: ids } },
    }),
    prisma.groupPermission.deleteMany({
      where: { group_id: { in: ids } },
    }),
    prisma.group.deleteMany({
      where: { id: { in: ids } },
    }),
  ]);

  if (count === 0) {
    throw new NotFoundError('Os grupos não foram encontrados');
  }
}
