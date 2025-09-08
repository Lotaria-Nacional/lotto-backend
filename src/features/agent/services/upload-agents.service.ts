import { agentBulkSchema } from '@lotaria-nacional/lotto';
import prisma from '../../../lib/prisma';

export async function uploadAgentsService(data: any[]) {
  const validAgents = [];
  const errors = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const parsed = agentBulkSchema.safeParse(row);

    if (!parsed.success) {
      errors.push({ row: i + 1, issues: parsed.error.format() });
      continue;
    }

    validAgents.push(parsed.data);
  }

  if (validAgents.length > 0) {
    await prisma.agent.createMany({
      data: validAgents,
      skipDuplicates: true, // ignora duplicados em id_reference
    });
  }

  return {
    inserted: validAgents.length,
    errors,
  };
}
