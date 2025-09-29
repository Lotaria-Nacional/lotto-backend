import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { AuthPayload, CreateGroupDTO } from '@lotaria-nacional/lotto';

export async function createGroupService(data: CreateGroupDTO, user: AuthPayload) {
  return await prisma.$transaction(async tx => {
    // 1. Buscar grupo "Pendentes"
    const pendingGroup = await tx.group.findFirst({
      where: { name: { contains: 'pendentes', mode: 'insensitive' } }, // ajusta se o nome/slug for outro
    });

    // 2. Se existir, remover memberships dos users desse grupo
    if (pendingGroup && data.users_id?.length) {
      await tx.membership.deleteMany({
        where: {
          user_id: { in: data.users_id },
          group_id: pendingGroup.id,
        },
      });
    }

    // 3. Criar o novo grupo e adicionar os utilizadores
    const group = await tx.group.create({
      data: {
        name: data.name,
        description: data.description,

        memberships: data.users_id?.length
          ? {
              create: data.users_id.map(userId => ({
                user: { connect: { id: userId } },
              })),
            }
          : undefined,

        permissions: data.permissions?.length
          ? {
              create: data.permissions.map(permission => ({
                module: permission.module,
                action: permission.actions,
              })),
            }
          : undefined,
      },
      include: {
        memberships: true,
        permissions: true,
      },
    });

    await audit(tx, 'CREATE', {
      entity: 'GROUP',
      before: null,
      after: group,
      user,
      description: 'Criou um grupo',
    });

    return group.id;
  });
}
