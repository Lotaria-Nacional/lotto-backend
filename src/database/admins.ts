import { Prisma } from '@prisma/client';

export async function seedAdministrations(tx: Prisma.TransactionClient) {
  const adminNames = [
    'rangel',
    'maianga',
    'kilamba kiaxi',
    'ingombota',
    'mulenvos',
    'samba',
    'talatona',
    'viana',
    'cacuaco',
    'cazenga',
    'sambizanga',
    'hoji-ya-henda',
  ];

  const administrations = await Promise.all(
    adminNames.map(name =>
      tx.administration.upsert({
        where: { name },
        create: {
          name: name.trim().toLocaleLowerCase(),
        },
        update: {
          name: name.trim().toLocaleLowerCase(),
        },
      })
    )
  );

  return administrations;
}
