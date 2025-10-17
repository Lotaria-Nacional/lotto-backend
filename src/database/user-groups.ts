import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

export async function seedUsersAndGroups(tx: Prisma.TransactionClient) {
  const pauloPassword = await bcrypt.hash('msftsrep0.', 10);
  const divaldoPassword = await bcrypt.hash('Lp6#YtX4$Nq10', 10);
  const sebastiaoPassword = await bcrypt.hash('MenteCriativa@1', 10);

  const { id: pauloId } = await tx.user.create({
    data: {
      first_name: 'Paulo',
      last_name: 'Luguenda',
      email: 'p.luguenda@lotarianacional.co.ao',
      password: pauloPassword,
      role: 'admin',
    },
  });

  const { id: sebastiaoId } = await tx.user.create({
    data: {
      first_name: 'Sebastião',
      last_name: 'Simão',
      email: 's.simao@lotarianacional.co.ao',
      password: sebastiaoPassword,
      role: 'admin',
    },
  });

  const { id: divaldoId } = await tx.user.create({
    data: {
      first_name: 'Divaldo',
      last_name: 'Cristóvão',
      email: 'divaldoc@lotarianacional.co.ao',
      password: divaldoPassword,
      role: 'admin',
    },
  });

  await tx.group.create({
    data: {
      name: 'Admin',
      description: 'This is a test group',
      memberships: {
        createMany: { data: [{ user_id: pauloId }, { user_id: sebastiaoId }, { user_id: divaldoId }] },
      },
      permissions: { createMany: { data: [{ module: 'all', action: ['manage'] }] } },
    },
  });

  await tx.group.create({
    data: {
      name: 'Pendentes',
      description: 'Usuários recém-criados que ainda não têm grupo definido',
    },
  });
}
