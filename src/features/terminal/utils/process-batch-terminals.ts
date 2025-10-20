import prisma from '../../../lib/prisma';
import { Prisma, TerminalStatus } from '@prisma/client';
import { SimCardStatus } from '@lotaria-nacional/lotto';
import { CHUNK_SIZE } from '../../agent/utils/process-batch-agents';
import { ImportTerminalsDTO } from '../validation/import-terminal-schema';

export async function processBatchTerminals(batch: ImportTerminalsDTO[]) {
  if (batch.length === 0) return { count: 0, errors: [] };

  const errors: any[] = [];
  let processed = 0;

  for (let i = 0; i < batch.length; i += CHUNK_SIZE) {
    const chunk = batch.slice(i, i + CHUNK_SIZE);

    for (const terminal of chunk) {
      try {
        await prisma.$transaction(async tx => {
          const { agentIdRef, terminalStatus } = await getAgentId(tx, terminal);

          const data = {
            serial: terminal.serial_number,
            device_id: terminal.device_id,
            status: terminalStatus ?? undefined,
            agent_id_reference: agentIdRef,
            activated_at: terminal.activatedAt,
            sim_card: terminal.sim_card_number
              ? {
                  connectOrCreate: {
                    where: { number: terminal.sim_card_number },
                    create: {
                      number: terminal.sim_card_number,
                      pin: terminal.pin,
                      puk: terminal.puk,
                      status: 'stock' as SimCardStatus,
                    },
                  },
                }
              : undefined,
          };

          if (terminal.sim_card_number) {
            // Tenta encontrar o SIM existente
            const existingSim = await tx.simCard.findUnique({
              where: { number: terminal.sim_card_number },
            });

            if (existingSim) {
              // Desassocia de outro terminal, se houver
              await tx.simCard.update({
                where: { number: terminal.sim_card_number },
                data: { terminal_id: null },
              });
            }

            data.sim_card = {
              connectOrCreate: {
                where: { number: terminal.sim_card_number },
                create: {
                  number: terminal.sim_card_number,
                  pin: terminal.pin,
                  puk: terminal.puk,
                  status: 'stock' as SimCardStatus,
                },
              },
            };
          }

          const existing = await tx.terminal.findUnique({
            where: { serial: terminal.serial_number },
          });

          if (existing) {
            await tx.terminal.update({
              where: { serial: terminal.serial_number },
              data,
            });
          } else {
            await tx.terminal.create({ data });
          }
        });

        processed++;
      } catch (err) {
        console.log('PROCESS TERMINAL BATCH ERROR: ', err);
        errors.push({ serial: terminal.serial_number, error: (err as any).message });
      }
    }
  }

  return { count: processed, errors };
}

const getAgentId = async (tx: Prisma.TransactionClient, terminal: ImportTerminalsDTO) => {
  let agentIdRef: number | null = null;
  let terminalStatus: TerminalStatus | undefined = terminal.status;

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
      if (agent.pos?.id) terminalStatus = 'on_field';

      // Remove ligação anterior
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
