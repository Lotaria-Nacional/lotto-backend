import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { UpdateGroupDTO } from '../schemas/update.schema';

export async function updateGroupService(data: UpdateGroupDTO) {
  return await prisma.$transaction(async (tx) => {
    const group = await tx.group.findUnique({
      where: { id: data.id },
    });

    if (!group) throw new NotFoundError('Grupo não encontrado');

    const updatedGroup = await tx.group.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        description: data.description,

        // update permissions if thers's something to update
        ...(data.permissions?.length
          ? {
              permissions: {
                upsert: data.permissions.map((perm) => ({
                  where: {
                    group_id_module: {
                      group_id: data.id,
                      module: perm.module,
                    },
                  },
                  update: {
                    action: perm.actions,
                  },
                  create: {
                    module: perm.module,
                    action: perm.actions,
                  },
                })),
              },
            }
          : {}),
      },
      include: {
        permissions: true,
      },
    });

    return updatedGroup.id;
  });
}
