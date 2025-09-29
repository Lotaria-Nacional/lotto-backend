import prisma from '../../../lib/prisma';

export async function getUserPermissionsService(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      membership: {
        include: {
          group: {
            include: {
              permissions: true,
            },
          },
        },
      },
    },
  });

  if (!user) return [];

  const permissions = user.membership.flatMap(group => group.group.permissions);

  return permissions.map(p => ({
    action: p.action,
    feature: p.module,
  }));
}
