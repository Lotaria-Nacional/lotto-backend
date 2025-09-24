import prisma from '../../../lib/prisma';
import { ImportAgentDTO } from '../services/import-agents-service';
import { AgentType, AuthPayload, Genre } from '@lotaria-nacional/lotto';

type ProcessAgentsBatch = {
  agents: ImportAgentDTO[];
  user: AuthPayload;
  errors: any[];
};

export async function processAgentsBatch({ agents, errors, user }: ProcessAgentsBatch) {
  for (const agentData of agents) {
    try {
      await prisma.$transaction(async tx => {
        // --- Criar agente ---
        const id_reference = agentData.id_reference.toString();
        const agent_type: AgentType = id_reference.startsWith('1') ? 'revendedor' : 'lotaria_nacional';
        const genre: Genre = agentData.gender;

        await tx.agent.create({
          data: {
            id_reference: agentData.id_reference,
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
      });
    } catch (err: any) {
      errors.push({ row: agentData, error: err.message || err });
    }
  }
}
