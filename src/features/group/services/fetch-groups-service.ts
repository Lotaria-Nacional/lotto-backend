import prisma from '../../../lib/prisma';

export async function fetchManyGroupsService() {
  const groups = await prisma.group.findMany({
    orderBy: {
      created_at: 'desc',
    },
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

  return groups;
}
