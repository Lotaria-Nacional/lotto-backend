import prisma from '../../../lib/prisma';
import { ImportAgentDTO } from '../services/import-agents-service';
import { AgentType, AuthPayload, Genre } from '@lotaria-nacional/lotto';

type ProcessAgentsBatch = {
  agents: ImportAgentDTO[];
  user: AuthPayload;
  errors: any[];
};

export async function processAgentsBatch({ agents, errors, user }: ProcessAgentsBatch) {
  const groupedByType: Partial<Record<AgentType, number>> = {};

  await prisma.$transaction(async tx => {
    for (const agentData of agents) {
      try {
        const id_reference = agentData.id_reference;
        const agent_type: AgentType = id_reference.toString().startsWith('1') ? 'revendedor' : 'lotaria_nacional';

        const genre: Genre = agentData.gender;

        await tx.agent.create({
          data: {
            id_reference,
            first_name: agentData.name,
            last_name: agentData.last_name,
            bi_number: agentData.bi_number,
            genre,
            status: agentData.status,
            phone_number: agentData.phone_number,
            training_date: agentData.training_date,
            agent_type,
          },
          include: {
            pos: true,
            terminal: true,
          },
        });

        // Regista o maior id_reference usado por tipo
        if (!groupedByType[agent_type] || groupedByType[agent_type]! < id_reference) {
          groupedByType[agent_type] = id_reference;
        }
      } catch (err: any) {
        errors.push({ row: agentData, error: err.message || err });
      }
    }

    // --- Depois de inserir os agentes, sincronizar counters ---
    for (const [type, maxId] of Object.entries(groupedByType)) {
      await tx.idReference.updateMany({
        where: {
          type: type as AgentType,
          counter: { lt: maxId }, // só actualiza se o counter for menor
        },
        data: { counter: maxId },
      });
    }
  });
}
