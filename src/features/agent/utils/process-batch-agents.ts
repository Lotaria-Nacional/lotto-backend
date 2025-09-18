import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { AgentStatus, AuthPayload, CreateAgentDTO } from '@lotaria-nacional/lotto';

type ProcessAgentsBatch = {
  agents: CreateAgentDTO[];
  user: AuthPayload;
  errors: any[];
};

export async function processAgentsBatch({ agents, errors, user }: ProcessAgentsBatch) {
  for (const agentData of agents) {
    try {
      await prisma.$transaction(async (tx) => {
        // --- Criar agente ---
        const agent = await tx.agent.create({
          data: {
            ...agentData,
            status: agentData.terminal_id ? 'ready' : 'ready', // default inicial
          },
          include: {
            pos: true,
            terminal: true,
          },
        });

        // --- Se houver terminal, associar e atualizar estados ---
        if (agentData.terminal_id) {
          const terminal = await tx.terminal.findUnique({ where: { id: agentData.terminal_id } });
          if (!terminal) throw new Error(`Terminal ${agentData.terminal_id} não encontrado`);
          if (terminal.agent_id_reference && terminal.agent_id_reference !== agent.id_reference) {
            throw new Error(`Terminal ${agentData.terminal_id} já está associado a outro agente`);
          }

          // Atualizar estado do terminal
          await tx.terminal.update({
            where: { id: terminal.id },
            data: {
              agent_id_reference: agent.id_reference,
              status: agent.pos ? 'on_field' : terminal.status,
            },
          });

          // Atualizar estado do agente
          let newAgentStatus: AgentStatus = agent.pos ? 'active' : 'ready';
          await tx.agent.update({
            where: { id: agent.id },
            data: { status: newAgentStatus },
          });

          // Audit log
          await audit(tx, 'IMPORT', {
            user,
            before: null,
            after: null,
            entity: 'AGENT',
          });
        }
      });
    } catch (err: any) {
      errors.push({ row: agentData, error: err.message || err });
    }
  }
}
