import prisma from '../../../lib/prisma';
import { simCardBulkSchema } from '../schemas/sim-bulk-schema';

export async function uploadSimCardsService(data: any[]) {
  const validSimCards = [];
  const errors = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const parsed = simCardBulkSchema.safeParse(row);

    if (!parsed.success) {
      errors.push({ row: i + 1, issues: parsed.error.format() });
      continue;
    }

    validSimCards.push(parsed.data);
  }

  if (validSimCards.length > 0) {
    await prisma.simCard.createMany({
      data: validSimCards,
      skipDuplicates: true, // ignora duplicados em number
    });
  }

  return {
    inserted: validSimCards.length,
    errors,
  };
}
