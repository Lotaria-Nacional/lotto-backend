import prisma from '../../../lib/prisma';
import { CHUNK_SIZE } from '../../agent/utils/process-batch-agents';
import { Prisma, SimCardStatus, TerminalStatus } from '@prisma/client';
import { ImportTerminalsDTO } from '../validation/import-terminal-schema';

export async function processBatchTerminals(batch: ImportTerminalsDTO[]) {
  if (batch.length === 0) return { count: 0, errors: [] };

  const errors: any[] = [];
  let processed = 0;

  // elimina duplicados pelo serial_number
  const uniqueBatch = [...new Map(batch.map(t => [t.serial_number, t])).values()];

  console.log(`Batch recebido: ${batch.length}`);
  console.log(`Batch único (sem duplicados): ${uniqueBatch.length}`);

  for (let i = 0; i < uniqueBatch.length; i += CHUNK_SIZE) {
    const chunk = uniqueBatch.slice(i, i + CHUNK_SIZE);

    for (const terminal of chunk) {
      try {
        await prisma.$transaction(
          async tx => {
            const { agentIdRef, terminalStatus } = await getIdReferenceAndTerminalStatus(tx, terminal);

            const data: Prisma.TerminalUncheckedCreateInput = {
              serial: terminal.serial_number,
              device_id: terminal.device_id,
              status: terminalStatus,
              agent_id_reference: agentIdRef,
              obs: terminal.obs,
              activated_at: terminal.activatedAt,
            };

            const terminalRecord = await tx.terminal.upsert({
              where: { serial: terminal.serial_number },
              update: data,
              create: data,
            });

            await createSimCard({ id: terminalRecord.id, tx, input: terminal });
          },
          { isolationLevel: 'ReadCommitted' }
        );

        processed++;
      } catch (err) {
        console.error('❌ Erro no terminal:', terminal.serial_number, err);
        errors.push({
          serial: terminal.serial_number,
          error: (err as any).message,
        });
      }
    }
  }

  return { count: processed, errors };
}

// 🔹 Função auxiliar
const getIdReferenceAndTerminalStatus = async (tx: Prisma.TransactionClient, terminal: ImportTerminalsDTO) => {
  let agentIdRef: number | null = null;
  let terminalStatus: TerminalStatus | undefined = 'stock';

  if (terminal.sim_card_number) {
    terminalStatus = TerminalStatus.ready;
  }

  if (terminal.status === 'broken') {
    terminalStatus = TerminalStatus.broken;
    agentIdRef = null;
  }

  if (terminal.agent_id_reference) {
    const agent = await tx.agent.findUnique({
      where: { id_reference: terminal.agent_id_reference },
      select: {
        id_reference: true,
        pos: { select: { id: true } },
        terminal: { select: { id: true } },
      },
    });

    if (agent) {
      agentIdRef = agent.id_reference;
      terminalStatus = agent.pos?.id ? TerminalStatus.on_field : TerminalStatus.delivered;

      // Remove ligação antiga
      if (agent.terminal?.id) {
        await tx.terminal.updateMany({
          where: { agent_id_reference: agentIdRef },
          data: { agent_id_reference: null },
        });
      }
    }
  }

  return { agentIdRef, terminalStatus };
};

interface ICreateSimCardDTO {
  id: string;
  tx: Prisma.TransactionClient;
  input: ImportTerminalsDTO;
}

const createSimCard = async ({ id, input, tx }: ICreateSimCardDTO) => {
  if (input.sim_card_number) {
    // Desassocia qualquer outro SIM ativo
    await tx.simCard.updateMany({
      where: {
        terminal_id: id,
        number: { not: input.sim_card_number },
      },
      data: { terminal_id: null },
    });

    // Cria ou atualiza o SIM
    await tx.simCard.upsert({
      where: { number: input.sim_card_number },
      update: {
        terminal_id: id,
        pin: input.pin,
        puk: input.puk,
        chip_serial_number: input.chip_serial_number,
        status: SimCardStatus.active,
      },
      create: {
        number: input.sim_card_number,
        pin: input.pin,
        puk: input.puk,
        chip_serial_number: input.chip_serial_number,
        status: SimCardStatus.active,
        terminal_id: id,
      },
    });
  }
};
