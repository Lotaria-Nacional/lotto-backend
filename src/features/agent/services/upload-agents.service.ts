import prisma from '../../../lib/prisma';
import { agentBulkSchema, AuthPayload } from '@lotaria-nacional/lotto';
import { audit } from '../../../utils/audit-log';

export async function uploadAgentsService(data: any[], user: AuthPayload) {
  await prisma.$transaction(async tx => {
    const validAgents = [];
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const parsed = agentBulkSchema.safeParse(row);

      if (!parsed.success) {
        errors.push({ row: i + 1, issues: parsed.error.format });
        continue;
      }

      validAgents.push(parsed.data);
    }

    if (validAgents.length > 0) {
      await tx.agent.createMany({
        data: validAgents,
        skipDuplicates: true,
      });
    }

    await audit(tx, 'IMPORT', {
      user,
      before: null,
      after: null,
      entity: 'AGENT',
    });

    return {
      inserted: validAgents.length,
      errors,
    };
  });
}
