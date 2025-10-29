import { Agent } from '@prisma/client';
import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { BadRequestError, NotFoundError } from '../../../errors';
import { AgentStatus, AuthPayload, UpdateAgentDTO } from '@lotaria-nacional/lotto';

export async function activateAgentService(data: UpdateAgentDTO & { user: AuthPayload }) {
  await prisma.$transaction(async (tx) => {
    const agent = await tx.agent.findUnique({
      where: { id: data.id },
      include: { pos: true, terminal: true },
    });

    if (!agent) throw new NotFoundError('Agente não encontrado');
    if (!data.terminal_id) throw new BadRequestError('É necessário informar um terminal');

    // --- Buscar terminal ---
    const terminal = await tx.terminal.findUnique({
      where: { id: data.terminal_id },
    });

    if (!terminal) throw new NotFoundError('Terminal não encontrado');

    // --- Validar exclusividade ---
    if (terminal.agent_id_reference && terminal.agent_id_reference !== data.id_reference) {
      throw new BadRequestError('Este terminal já está associado a outro agente');
    }

    if (agent.terminal && agent.terminal.id !== data.terminal_id) {
      throw new BadRequestError('Este agente já possui outro terminal associado');
    }

    // --- Definir estados ---
    let newAgentStatus: AgentStatus;
    if (agent.pos) {
      // Agente tem POS → fica ativo
      newAgentStatus = 'active';
      await tx.pos.update({
        where: { id: agent.pos.id },
        data: { status: 'active' },
      });
    } else {
      // Agente sem POS → fica ready
      newAgentStatus = 'ready';
    }

    // --- Atualizar terminal ---
    await tx.terminal.update({
      where: { id: data.terminal_id },
      data: {
        agent_id_reference: agent.id_reference,
        status: agent.pos ? 'on_field' : 'delivered', // <--- ajustado
        delivery_at: new Date(),
      },
    });

    // --- Atualizar agente ---
    const agentUpdated: Agent = await tx.agent.update({
      where: { id: data.id },
      data: { status: newAgentStatus },
    });

    // --- Audit log ---
    await audit(tx, 'ACTIVATE', {
      user: data.user,
      before: agent,
      after: agentUpdated,
      entity: 'AGENT',
      description: 'Atribuiu um terminal a um agente',
    });
  });
}
