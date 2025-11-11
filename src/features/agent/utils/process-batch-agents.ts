import prisma from '../../../lib/prisma';
import { ImportAgentDTO } from '../validation/import-agent-schema';
import { AgentType, Genre } from '@prisma/client';

export const CHUNK_SIZE = 500;

export async function processBatchAgents(batch: ImportAgentDTO[]) {
  if (batch.length === 0) return 0;

  for (let i = 0; i < batch.length; i += CHUNK_SIZE) {
    const chunk = batch.slice(i, i + CHUNK_SIZE);

    try {
      await prisma.$transaction(async tx => {
        for (const agent of chunk) {
          const data = {
            id_reference: agent.id_reference,
            first_name: agent.name,
            last_name: agent.last_name,
            genre: agent.gender as Genre,
            training_date: agent.training_date,
            status: agent.status,
            area: agent.area,
            zone: agent.zone,
            bi_number: agent.bi_number,
            phone_number: agent.phone_number,
            agent_type: agent.id_reference.toString().startsWith('1')
              ? ('revendedor' as AgentType)
              : ('lotaria_nacional' as AgentType),
          };

          await tx.agent.upsert({
            where: { id_reference: agent.id_reference },
            create: data,
            update: data,
          });
        }
      });
    } catch (error) {
      console.log('PROCESS AGENTS BATCH ERROR: ', error);
    }
  }

  const count = batch.length;
  batch.length = 0;
  return count;
}
