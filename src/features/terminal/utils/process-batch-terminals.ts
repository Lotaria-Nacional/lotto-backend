import { TerminalStatus } from '@lotaria-nacional/lotto';
import prisma from '../../../lib/prisma';
import { CHUNK_SIZE } from '../../agent/utils/process-batch-agents';
import { ImportTerminalsDTO } from '../validation/import-terminal-schema';

export async function processBatchTerminals(batch: ImportTerminalsDTO[]) {
  for (let i = 0; i < batch.length; i += CHUNK_SIZE) {
    const chunk = batch.slice(i, i + CHUNK_SIZE);

    await prisma.$transaction(async tx => {
      for (const terminal of chunk) {
        const terminalData = {
          serial: terminal.serial_number,
          agent_id_reference: terminal.agent_id_reference,
          device_id: terminal.device_id,
          sim_card_number: terminal.sim_card_number,
          pin: terminal.pin,
          puk: terminal.puk,
          status: terminal.status ? (terminal.status as TerminalStatus) : undefined,
          chipserial_number: terminal.chip_serial_number,
          activated_at: terminal.activatedAt,
        };

        let agentIdRef: number | null = null;
        let terminalStatus: TerminalStatus = terminalData.status!;

        try {
          if (terminalData.agent_id_reference) {
            const agent = await tx.agent.findUnique({
              where: { id_reference: terminalData.agent_id_reference },
              select: { id_reference: true, pos: { select: { id: true } } },
            });
            if (agent) {
              agentIdRef = agent.id_reference;
              if (agent.pos?.id) {
                terminalStatus = 'on_field';
              }
            }
          }

          await tx.terminal.upsert({
            where: { serial: terminalData.serial },
            create: {
              serial: terminalData.serial,
              device_id: terminalData.device_id,
              status: terminalStatus ?? undefined,
              agent_id_reference: agentIdRef,
              activated_at: terminalData.activated_at,
              sim_card: terminalData.sim_card_number
                ? {
                    connectOrCreate: {
                      where: { number: terminalData.sim_card_number },
                      create: {
                        number: terminalData.sim_card_number,
                        pin: terminalData.pin,
                        puk: terminalData.puk,
                        status: 'stock',
                      },
                    },
                  }
                : undefined,
            },
            update: {
              serial: terminalData.serial,
              device_id: terminalData.device_id,
              status: terminalStatus ?? undefined,
              agent_id_reference: agentIdRef,
              activated_at: terminalData.activated_at,
              sim_card: terminalData.sim_card_number
                ? {
                    connectOrCreate: {
                      where: { number: terminalData.sim_card_number },
                      create: {
                        number: terminalData.sim_card_number,
                        pin: terminalData.pin,
                        puk: terminalData.puk,
                        status: 'stock',
                      },
                    },
                  }
                : undefined,
            },
          });
        } catch (err: any) {
          if (err.code === 'P2002' && err.meta?.target?.includes('agent_id_reference')) {
            console.warn(`Ignorado duplicado do agente ${agentIdRef}`);
          }
        }
      }
    });
  }

  const count = batch.length;
  batch.length = 0;
  return count;
}
