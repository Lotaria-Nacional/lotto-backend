import prisma from '../../../lib/prisma';
import { AuthPayload, CreateGroupDTO } from '@lotaria-nacional/lotto';

export async function createGroupService(data: CreateGroupDTO, _user: AuthPayload) {
  return await prisma.$transaction(async (tx) => {
    // 1. Obter o grupo "pendente"
    const pendingGroup = await tx.group.findFirst({
      where: { name: { equals: 'pendentes', mode: 'insensitive' } },
    });

    // 2. Criar o novo grupo
    const group = await tx.group.create({
      data: {
        name: data.name,
        description: data.description,
        // memberships e permissions vamos tratar abaixo
      },
    });

    // 3. Se houver users, tratar memberships
    if (data.users_id && data.users_id.length > 0) {
      // Remover os utilizadores do grupo "pendente"
      if (pendingGroup) {
        await tx.membership.deleteMany({
          where: {
            user_id: { in: data.users_id },
            group_id: pendingGroup.id,
          },
        });
      }

      // Adicionar ao novo grupo
      await tx.membership.createMany({
        data: data.users_id.map((userId) => ({
          user_id: userId,
          group_id: group.id,
        })),
      });
    }

    // 4. Criar permissões, se existirem
    if (data.permissions && data.permissions.length > 0) {
      await tx.groupPermission.createMany({
        data: data.permissions.map((permission) => ({
          group_id: group.id,
          module: permission.module,
          action: permission.actions,
        })),
      });
    }

    return group.id;
  });
}
