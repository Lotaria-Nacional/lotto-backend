import { Agent } from '@prisma/client';
import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { BadRequestError, NotFoundError } from '../../../errors';
import { AgentStatus, AuthPayload, TerminalStatus, UpdateAgentDTO } from '@lotaria-nacional/lotto';

export async function associatePosAndagentOnAgentService(data: UpdateAgentDTO & { user: AuthPayload }) {
  await prisma.$transaction(async (tx) => {
    const agent = await tx.agent.findUnique({
      where: { id: data.id },
      include: { pos: true, terminal: true },
    });

    if (!agent) throw new NotFoundError('Agente não encontrado');

    let agentUpdated: Agent | null = null;

    // --- Associar POS ---
    if (data.pos_id) {
      const pos = await tx.pos.findUnique({ where: { id: data.pos_id } });
      if (!pos) throw new NotFoundError('POS não encontrado');

      if (pos.agent_id_reference) {
        throw new BadRequestError('Este POS já está ocupado');
      }

      await tx.pos.update({
        where: { id: data.pos_id },
        data: {
          agent_id_reference: data.id_reference,
          status: 'active',
        },
      });

      agentUpdated = await tx.agent.update({
        where: { id: data.id },
        data: { status: 'active' },
      });
    }

    // --- Associar TERMINAL ---
    if (data.terminal_id) {
      const terminal = await tx.terminal.findUnique({ where: { id: data.terminal_id } });
      if (!terminal) throw new NotFoundError('Terminal não encontrado');

      // Desvincular outro terminal do mesmo agente (se existir)
      const oldTerminal = await tx.terminal.findFirst({
        where: { agent_id_reference: data.id_reference, NOT: { id: data.terminal_id } },
      });

      if (oldTerminal) {
        await tx.terminal.update({
          where: { id: oldTerminal.id },
          data: { agent_id_reference: null, status: 'stock' },
        });
      }

      // Verificar novamente agente (com POS ou não)
      const agentWithPos = await tx.agent.findUnique({
        where: { id: data.id },
        include: { pos: { select: { id: true } } },
      });
      if (!agentWithPos) throw new NotFoundError('Agente não encontrado');

      let newTerminalStatus: TerminalStatus = 'ready';
      let newAgentStatus: AgentStatus = agentWithPos.status;

      if (agentWithPos.pos && agentWithPos.pos.id) {
        // agente com POS → terminal on_field + agente active
        newTerminalStatus = 'on_field';
        newAgentStatus = 'active';
      } else {
        // agente sem POS → terminal ready + agente ready
        newTerminalStatus = 'ready';
        newAgentStatus = 'ready';
      }

      await tx.terminal.update({
        where: { id: data.terminal_id },
        data: {
          agent_id_reference: data.id_reference,
          status: newTerminalStatus,
        },
      });

      agentUpdated = await tx.agent.update({
        where: { id: data.id },
        data: { status: newAgentStatus },
      });
    }

    // --- Audit log ---
    await audit(tx, 'ASSOCIATE', {
      user: data.user,
      before: agent,
      after: agentUpdated,
      entity: 'AGENT',
    });
  });
}
