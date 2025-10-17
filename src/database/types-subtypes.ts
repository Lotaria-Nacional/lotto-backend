import { Prisma } from '@prisma/client';

export async function seedTypesAndSubtypes(tx: Prisma.TransactionClient) {
  await tx.type.createMany({
    data: [{ name: 'ambulante' }, { name: 'popupkit' }, { name: 'comércio' }],
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
      name: 'agência',
      subtypes: {
        createMany: {
          data: [
            { name: 'viana' },
            { name: 'morro bento' },
            { name: 'talatona' },
            { name: 'palanca' },
            { name: 'nova vida' },
            { name: 'patriota' },
            { name: 'cacuaco' },
            { name: 'palanca' },
            { name: 'benfica' },
            { name: 'samba' },
            { name: 'mulenvos' },
          ],
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
