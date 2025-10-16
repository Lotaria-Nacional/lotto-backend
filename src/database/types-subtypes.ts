import { Prisma } from '@prisma/client';

export async function seedTypesAndSubtypes(tx: Prisma.TransactionClient) {
  await tx.type.createMany({
    data: [{ name: 'ambulante' }, { name: 'popupkit' }, { name: 'agências' }, { name: 'comércio' }],
  });

  await tx.type.create({
    data: {
      name: 'supermercado',
      subtypes: {
        createMany: {
          data: [{ name: 'arreiou' }, { name: 'kibabo' }, { name: 'nossa casa' }, { name: 'angomart' }],
        },
      },
    },
  });

  await tx.type.create({
    data: {
      name: 'quiosque',
      subtypes: {
        createMany: {
          data: [{ name: 'bancada' }, { name: 'roulote' }],
        },
      },
    },
  });
}
