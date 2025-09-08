import prisma from '../../../lib/prisma';
import { terminalBulkSchema } from '../schema/bulk.schema';

export async function uploadTerminalsService(data: any[]) {
  const validTerminals = [];
  const errors = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const parsed = terminalBulkSchema.safeParse(row);

    if (!parsed.success) {
      errors.push({ row: i + 1, issues: parsed.error.format() });
      continue;
    }

    validTerminals.push(parsed.data);
  }

  if (validTerminals.length > 0) {
    await prisma.terminal.createMany({
      data: validTerminals,
      skipDuplicates: true, // ignora duplicados em serial ou agent_id
    });
  }

  return {
    inserted: validTerminals.length,
    errors,
  };
}
