import prisma from '../../../lib/prisma';
import { AgentStatus, AuthPayload, TerminalStatus, UpdateAgentDTO } from '@lotaria-nacional/lotto';
import { BadRequestError, NotFoundError } from '../../../errors';
import { audit } from '../../../utils/audit-log';
import { Agent } from '@prisma/client';

export async function associatePosAndagentOnAgentService(data: UpdateAgentDTO & { user: AuthPayload }) {
  await prisma.$transaction(async tx => {
    const agent = await tx.agent.findUnique({
      where: { id: data.id },
      include: {
        pos: true,
        terminal: true,
      },
    });

    if (!agent) throw new NotFoundError('agent não encontrado');

    let agentUpdated: Agent | null = null;

    if (data.pos_id) {
      const pos = await tx.pos.findUnique({ where: { id: data.pos_id } });
      if (!pos) throw new NotFoundError('POS não encontrado');

      if (pos.agent_id) {
        throw new BadRequestError('Este POS já está ocupado');
      }

      await tx.pos.update({
        where: { id: data.pos_id },
        data: {
          agent_id: data.id,
          status: 'active',
        },
      });

      agentUpdated = await tx.agent.update({
        where: { id: data.id },
        data: {
          status: 'active',
        },
      });
    }

    if (data.terminal_id) {
      const terminal = await tx.terminal.findUnique({ where: { id: data.terminal_id } });

      if (!terminal) {
        throw new NotFoundError('Terminal não encontrado');
      }

      const oldTerminal = await tx.terminal.findFirst({
        where: { agent_id: data.id, NOT: { id: data.terminal_id } },
      });

      if (oldTerminal) {
        await tx.terminal.update({
          where: { id: oldTerminal.id },
          data: { agent_id: null },
        });
      }

      const agent = await tx.agent.findUnique({ where: { id: data.id }, include: { pos: { select: { id: true } } } });

      if (!agent) {
        throw new NotFoundError('Agent não encontrado');
      }

      const newStatus: TerminalStatus = terminal && agent?.pos ? 'on_field' : 'ready';

      let newAgentStatus: AgentStatus = agent?.status;

      if (terminal && agent?.pos) {
        newAgentStatus = 'active';
      } else if (terminal && !agent?.pos) {
        newAgentStatus = 'approved';
      }

      await tx.terminal.update({
        where: { id: data.terminal_id },
        data: {
          agent_id: data.id,
          status: newStatus,
        },
      });

      agentUpdated = await tx.agent.update({
        where: { id: data.id },
        data: {
          status: newAgentStatus,
        },
      });
    }

    await audit(tx, 'ASSOCIATE', {
      user: data.user,
      before: agent,
      after: agentUpdated,
      entity: 'AGENT',
    });
  });
}
