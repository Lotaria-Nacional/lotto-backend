import { Prisma } from '@prisma/client';

export async function seedZones(tx: Prisma.TransactionClient) {
  const zoneNumbers = Array.from({ length: 24 }, (_, i) => i + 1);

  const zones = await Promise.all(zoneNumbers.map(number => tx.zone.create({ data: { number } })));

  return zones;
}
