import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { NotFoundError } from '../../../errors';
import { AuthPayload, UpdateGroupDTO } from '@lotaria-nacional/lotto';
// import { deleteCache } from '../../../utils/redis';
// import { userId } from '../../../../test/setup';

export async function updateGroupService(data: UpdateGroupDTO, user: AuthPayload) {
  return await prisma.$transaction(async (tx) => {
    const group = await tx.group.findUnique({
      where: { id: data.id },
    });

    if (!group) throw new NotFoundError('Grupo não encontrado');

    // 1. Obter o grupo "pendente"
    const pendingGroup = await tx.group.findFirst({
      where: {
        name: {
          equals: 'pendentes',
          mode: 'insensitive', // caso o nome tenha maiúsculas/minúsculas diferentes
        },
      },
    });

    // 2. Atualizar info básica do grupo
    const updatedGroup = await tx.group.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
      },
      include: { permissions: true, memberships: true },
    });

    // 3. Atualizar permissões
    if (data.permissions) {
      await tx.groupPermission.deleteMany({
        where: { group_id: data.id },
      });

      if (data.permissions.length > 0) {
        await tx.groupPermission.createMany({
          data: data.permissions.map((perm) => ({
            group_id: data.id,
            module: perm.module,
            action: perm.actions,
          })),
        });
      }
    }

    // 4. Atualizar membros
    if (data.users_id) {
      // 1. Procurar grupo "Pendentes"
      const pendingGroup = await tx.group.findFirst({
        where: { name: { contains: 'pendentes', mode: 'insensitive' } }, // ajusta se o nome/slug for diferente
      });

      // 2. Se existir, remover usuários desse grupo
      if (pendingGroup && data.users_id.length > 0) {
        await tx.membership.deleteMany({
          where: {
            group_id: pendingGroup.id,
            user_id: { in: data.users_id },
          },
        });
      }

      // 3. Limpar memberships atuais do grupo alvo
      await tx.membership.deleteMany({
        where: { group_id: data.id },
      });

      // 4. Adicionar novos usuários ao grupo
      if (data.users_id.length > 0) {
        // Remover utilizadores do grupo "pendente", se existirem lá
        if (pendingGroup) {
          await tx.membership.deleteMany({
            where: {
              user_id: { in: data.users_id },
              group_id: pendingGroup.id,
            },
          });
        }

        // Adicionar ao grupo atualizado
        await tx.membership.createMany({
          data: data.users_id.map((userId) => ({
            group_id: data.id,
            user_id: userId,
          })),
        });
      }
    }

    await audit(tx, 'UPDATE', {
      entity: 'GROUP',
      before: group,
      after: updatedGroup,
      user,
      description: 'Atualizou um grupo',
    });

    // await deleteCache(`profile"${userId}`);

    return updatedGroup.id;
  });
}
