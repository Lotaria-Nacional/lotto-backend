import { Prisma } from '@prisma/client';

export async function seedAreas(tx: Prisma.TransactionClient) {
  const areasData = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  const areas = await Promise.all(
    areasData.map(async name =>
      tx.area.upsert({
        where: { name },
        create: { name },
        update: { name },
      })
    )
  );

  return areas;
}
