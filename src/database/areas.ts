import { Prisma } from '@prisma/client';

export async function seedAreas(tx: Prisma.TransactionClient) {
  const areasData = ['A', 'B', 'C', 'D', 'E', 'F'];

  const areas = await Promise.all(areasData.map((name) => tx.area.create({ data: { name } })));

  return areas;
}
