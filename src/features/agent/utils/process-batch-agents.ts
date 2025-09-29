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

  // Filtra e valida dados antes de inserir
  const validAgents: ImportAgentDTO[] = [];
  for (const agent of agents) {
    if (!agent.id_reference || !agent.name || !agent.last_name) {
      errors.push({ row: agent, error: 'Dados obrigatórios ausentes' });
      continue;
    }
    validAgents.push(agent);
  }

  try {
    await prisma.$transaction(async tx => {
      for (const agentData of validAgents) {
        const id_reference = agentData.id_reference;
        const agent_type: AgentType = id_reference.toString().startsWith('1') ? 'revendedor' : 'lotaria_nacional';
        const genre: Genre = agentData.gender;

        try {
          await tx.agent.upsert({
            where: { id_reference },
            create: {
              id_reference,
              agent_type,
              first_name: agentData.name,
              last_name: agentData.last_name,
              bi_number: agentData.bi_number,
              genre,
              status: agentData.status ?? 'approved',
              phone_number: agentData.phone_number,
              training_date: agentData.training_date ?? new Date(),
            },
            update: {
              first_name: agentData.name,
              last_name: agentData.last_name,
              bi_number: agentData.bi_number,
              genre,
              status: agentData.status ?? 'approved',
              phone_number: agentData.phone_number,
              training_date: agentData.training_date,
            },
          });

          // Atualiza max id por tipo
          if (!groupedByType[agent_type] || groupedByType[agent_type] < id_reference) {
            groupedByType[agent_type] = id_reference;
          }
        } catch (err: any) {
          errors.push({ row: agentData, error: err.message || err });
        }
      }
    });

    // Atualiza counters depois de processar o batch
    await prisma.$transaction(async tx => {
      for (const [type, maxId] of Object.entries(groupedByType)) {
        if (maxId > 0) {
          await tx.idReference.updateMany({
            where: {
              type: type as AgentType,
              counter: { lt: maxId },
            },
            data: { counter: maxId },
          });
        }
      }
    });
  } catch (err: any) {
    // Falha geral da transação
    errors.push({ row: null, error: `Falha batch completa: ${err.message || err}` });
  }
}
