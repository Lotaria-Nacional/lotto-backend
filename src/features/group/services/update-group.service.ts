import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { UpdateGroupDTO } from '@lotaria-nacional/lotto';

export async function updateGroupService(data: UpdateGroupDTO) {
  return await prisma.$transaction(async tx => {
    const group = await tx.group.findUnique({
      where: { id: data.id },
    });

    if (!group) throw new NotFoundError('Grupo não encontrado');

    const updatedGroup = await tx.group.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
      },
      include: { permissions: true, memberships: true },
    });

    if (data.permissions) {
      await tx.groupPermission.deleteMany({
        where: { group_id: data.id },
      });

      if (data.permissions.length > 0) {
        await tx.groupPermission.createMany({
          data: data.permissions.map(perm => ({
            group_id: data.id,
            module: perm.module,
            action: perm.actions,
          })),
        });
      }
    }

    if (data.users_id) {
      await tx.membership.deleteMany({
        where: { group_id: data.id },
      });

      if (data.users_id.length > 0) {
        await tx.membership.createMany({
          data: data.users_id.map(userId => ({
            group_id: data.id,
            user_id: userId,
          })),
        });
      }
    }

    return updatedGroup.id;
  });
}
