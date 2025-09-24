import prisma from '../../../lib/prisma';
import { AuthPayload, CreateGroupDTO } from '@lotaria-nacional/lotto';
import { audit } from '../../../utils/audit-log';

export async function createGroupService(data: CreateGroupDTO, user: AuthPayload) {
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

    // await audit(tx, 'CREATE', {
    //   // entity: 'GROUP',
    //   entity: 'GROUP',
    //   user: user,
    //   before: null,
    //   after: group,
    //   description: 'Criou um grupo',
    // });

    return group.id;
  });
}
