import prisma from '../../../lib/prisma';
import { ImportAgentDTO } from '../services/import-agents-service';
import { AgentType, AuthPayload, Genre } from '@lotaria-nacional/lotto';

type ProcessAgentsBatch = {
  agents: ImportAgentDTO[];
  user: AuthPayload;
  errors: any[];
};

export async function processAgentsBatch({ agents, errors, user }: ProcessAgentsBatch) {
  const groupedByType: Record<AgentType, number> = {
    revendedor: 0,
    lotaria_nacional: 0,
  };

  for (const agentData of agents) {
    try {
      await prisma.$transaction(async tx => {
        const id_reference = agentData.id_reference;
        const agent_type: AgentType = id_reference.toString().startsWith('1') ? 'revendedor' : 'lotaria_nacional';
        const genre: Genre = agentData.gender;

        // Usa upsert para criar ou atualizar
        await tx.agent.upsert({
          where: { id_reference: id_reference }, // assume que tens um unique composto
          create: {
            id_reference,
            agent_type,
            first_name: agentData.name,
            last_name: agentData.last_name,
            bi_number: agentData.bi_number,
            genre,
            status: agentData.status,
            phone_number: agentData.phone_number,
            training_date: agentData.training_date,
          },
          update: {
            first_name: agentData.name,
            last_name: agentData.last_name,
            bi_number: agentData.bi_number,
            genre,
            status: agentData.status,
            phone_number: agentData.phone_number,
            training_date: agentData.training_date,
          },
        });

        // Tracking para atualizar o id_reference
        if (!groupedByType[agent_type] || groupedByType[agent_type] < id_reference) {
          groupedByType[agent_type] = id_reference;
        }
      });
    } catch (err: any) {
      errors.push({ row: agentData, error: err.message || err });
    }
  }

  // Atualiza counters depois de processar o batch
  await prisma.$transaction(async tx => {
    for (const [type, maxId] of Object.entries(groupedByType)) {
      await tx.idReference.updateMany({
        where: {
          type: type as AgentType,
          counter: { lt: maxId },
        },
        data: { counter: maxId },
      });
    }
  });
}
