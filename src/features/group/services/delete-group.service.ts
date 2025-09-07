import { NotFoundError } from '../../../errors';
import prisma from '../../../lib/prisma';

export async function deleteGroupService(id: string) {
  await prisma.$transaction(async tx => {
    const group = await tx.group.findUnique({ where: { id } });

    if (!group) throw new NotFoundError('Grupo não encontrado');

    await tx.membership.deleteMany({
      where: {
        group_id: id,
      },
    });

    await tx.groupPermission.deleteMany({
      where: {
        group_id: id,
      },
    });

    await tx.group.delete({ where: { id } });
  });
}
