import prisma from '../../../lib/prisma';
import { BadRequestError, NotFoundError } from '../../../errors';
import { RedisKeys } from '../../../utils/redis/keys';
import { deleteCache } from '../../../utils/redis/delete-cache';
import { UpdateTerminalDTO } from '@lotaria-nacional/lotto';

export async function associateAgentAndSimCardOnTerminalService(data: UpdateTerminalDTO) {
  console.log(data);

  await prisma.$transaction(async tx => {
    const terminal = await tx.terminal.findUnique({ where: { id: data.id }, include: { sim_card: true } });

    if (!terminal) throw new NotFoundError('Terminal não encontrado');

    // 2️⃣ Valida agente existente
    if (data.agent_id) {
      const agent = await tx.agent.findUnique({ where: { id: data.agent_id } });
      if (!agent) throw new NotFoundError('Agente não encontrado');

      // Verifica se o agente já está associado a outro terminal
      const existingTerminal = await tx.terminal.findFirst({
        where: { agent_id: data.agent_id, id: { not: data.id } },
      });
      if (existingTerminal) throw new BadRequestError('Este agente já está associado a outro terminal');
    }

    // 3️⃣ Valida sim card existente
    if (data.sim_card_id) {
      const simCard = await tx.simCard.findUnique({ where: { id: data.sim_card_id } });
      if (!simCard) throw new NotFoundError('Sim Card não encontrado');

      // Verifica se o sim card já está associado a outro terminal
      const simCardInOtherTerminal = await tx.simCard.findFirst({
        where: {
          id: data.sim_card_id,
          NOT: [{ terminal_id: null }, { terminal_id: data.id }],
        },
      });

      if (simCardInOtherTerminal) throw new BadRequestError('Este sim card já está associado a outro terminal');

      // Atualiza o status e associa o sim card ao terminal
      await tx.simCard.update({
        where: { id: data.sim_card_id },
        data: { status: 'active', terminal_id: data.id },
      });
    }

    await tx.terminal.update({
      where: { id: data.id },
      data: {
        agent_id: data.agent_id ?? null,
      },
    });
  });

  // Limpeza de cache
  await Promise.all([deleteCache(RedisKeys.terminals.all()), deleteCache(RedisKeys.auditLogs.all())]);
}
