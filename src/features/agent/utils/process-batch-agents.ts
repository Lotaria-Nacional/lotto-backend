import { Genre } from '@prisma/client';
import prisma from '../../../lib/prisma';
import { AgentType } from '@lotaria-nacional/lotto';
import { ImportAgentDTO } from '../validation/import-agent-schema';

export const CHUNK_SIZE = 200;

export async function processBatchAgents(batch: ImportAgentDTO[]) {
  for (let i = 0; i < batch.length; i += CHUNK_SIZE) {
    const chunk = batch.slice(i, i + CHUNK_SIZE);

    await prisma.$transaction(
      chunk.map(agent => {
        const agentData = {
          id_reference: agent.id_reference,
          first_name: agent.name,
          last_name: agent.last_name,
          genre: agent.gender as Genre,
          training_date: agent.training_date,
          status: agent.status,
          bi_number: agent.bi_number,
          phone_number: agent.phone_number,
          agent_type: agent.id_reference.toString().startsWith('1') ? 'revendedor' : ('lotaria_nacional' as AgentType),
        };

        return prisma.agent.upsert({
          where: { id_reference: agent.id_reference },
          create: agentData,
          update: agentData,
        });
      })
    );
  }

  const count = batch.length;
  batch.length = 0;
  return count;
}
