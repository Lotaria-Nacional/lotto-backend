import { Prisma } from '@prisma/client';

export async function seedZones(tx: Prisma.TransactionClient) {
  const zoneNumbers = Array.from({ length: 32 }, (_, i) => i + 1);

  const zones = await Promise.all(
    zoneNumbers.map(async number =>
      tx.zone.upsert({
        where: { number },
        create: { number },
        update: { number },
      })
    )
  );

  return zones;
}
