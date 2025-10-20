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
    adminNames.map(name => tx.administration.create({ data: { name: name.trim().toLocaleLowerCase() } }))
  );

  return administrations;
}
