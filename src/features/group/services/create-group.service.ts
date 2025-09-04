import prisma from '../../../lib/prisma';
import { CreateGroupDTO } from '../schemas/create.schema';

export async function createGroupService(data: CreateGroupDTO) {
  return await prisma.$transaction(async (tx) => {
    const group = await tx.group.create({
      data: {
        name: data.name,
        description: data.description,

        // create memberships between users and group
        ...(data.users_id &&
          data.users_id.length > 0 && {
            memberships: {
              create: data.users_id.map((userId) => ({
                user: { connect: { id: userId } },
              })),
            },
          }),

        // create permissions for the group
        ...(data.permissions &&
          data.permissions.length > 0 && {
            permissions: {
              create: data.permissions.map((permission) => ({
                module: permission.module,
                action: permission.actions,
              })),
            },
          }),
      },
      include: {
        memberships: true,
        permissions: true,
      },
    });

    return group.id;
  });
}
