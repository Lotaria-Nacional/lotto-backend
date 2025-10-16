import prisma from '../lib/prisma';
import { TerminalStatus } from '@prisma/client';
import { AgentType, Genre, LicenceStatus } from '@lotaria-nacional/lotto';
import { ImportPosDTO } from '../features/pos/services/import-pos-sevice';
import { ImportAgentDTO } from '../features/agent/services/import-agents-service';
import { ImportLicenceDTO } from '../features/licence/services/import-licences-sevice';
import { ImportTerminalsDTO } from '../features/terminal/services/import-terminal-service';

const CHUNK_SIZE = 200;

export async function processBatchAgents(batch: ImportAgentDTO[]) {
  for (let i = 0; i < batch.length; i += CHUNK_SIZE) {
    const chunk = batch.slice(i, i + CHUNK_SIZE);

    await prisma.$transaction(
      chunk.map((agent) => {
        const agentData = {
          id_reference: agent.id_reference,
          first_name: agent.name,
          last_name: agent.last_name,
          genre: agent.gender as Genre,
          training_date: agent.training_date,
          status: agent.status,
          bi_number: agent.bi_number,
          phone_number: agent.phone_number,
          agent_type: agent.id_reference.toString().startsWith('1') ? 'revendedor' : ('lotaria_nacional' as AgentType),
        };

        return prisma.agent.upsert({
          where: { id_reference: agent.id_reference },
          create: agentData,
          update: agentData,
        });
      })
    );
  }

  const count = batch.length;
  batch.length = 0;
  return count;
}

export async function processBatchTerminals(batch: ImportTerminalsDTO[]) {
  for (let i = 0; i < batch.length; i += CHUNK_SIZE) {
    const chunk = batch.slice(i, i + CHUNK_SIZE);

    await prisma.$transaction(async (tx) => {
      for (const terminal of chunk) {
        const terminalData = {
          serial: terminal.serialNumber,
          agent_id_reference: terminal.idReference,
          device_id: terminal.deviceId,
          sim_card_number: terminal.simCardNumber,
          pin: terminal.pin,
          puk: terminal.puk,
          status: terminal.status ? (terminal.status as TerminalStatus) : undefined,
          chipserial_number: terminal.chipSerialNumber,
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

export async function processBatchLicences(batch: ImportLicenceDTO[]) {
  for (let i = 0; i < batch.length; i += CHUNK_SIZE) {
    const chunk = batch.slice(i, i + CHUNK_SIZE);

    await prisma.$transaction(
      chunk.map((licence) => {
        const licenceData = {
          admin_name: licence.admin_name,
          coordinates: licence.coordinates,
          description: licence.description,
          emitted_at: licence.emitted_at ?? new Date(),
          expires_at: licence.expires_at ?? new Date(),
          limit: licence.limit,
          district: licence.district,
          number: licence.number,
          reference: licence.reference,
          status: 'free' as LicenceStatus,
          latitude: 1,
          longitude: 1,
        };

        return prisma.licence.upsert({
          where: { reference: licenceData.reference },
          create: {
            ...licenceData,
            admin_name: licenceData.admin_name ?? undefined,
          },
          update: {
            ...licenceData,
            admin_name: licenceData.admin_name ?? undefined,
          },
        });
      })
    );
  }

  const count = batch.length;
  batch.length = 0;
  return count;
}

export async function processBatchPos(batch: ImportPosDTO[]) {
  for (let i = 0; i < batch.length; i += CHUNK_SIZE) {
    const chunk = batch.slice(i, i + CHUNK_SIZE);

    // Criar todos os dados antes da transação
    const data = await Promise.all(
      chunk.map(async (pos) => {
        let type_name: string | null = null;
        let subtype_name: string | null = null;

        // --- Buscar type/subtype ---
        if (pos.type_name) {
          const type = await prisma.type.findUnique({ where: { name: pos.type_name } });
          if (type) {
            type_name = type.name;
          } else {
            const subtype = await prisma.subtype.findUnique({
              where: { name: pos.type_name },
              include: { type: { select: { name: true } } },
            });

            if (subtype) {
              subtype_name = subtype.name;
              type_name = subtype.type.name;
            }
          }
        }

        // --- Buscar admin pela licença ---
        let admin_name = pos.admin_name;
        if (pos.licence) {
          const licence = await prisma.licence.findUnique({
            where: { reference: pos.licence },
            include: { admin: { select: { name: true } } },
          });
          if (licence && licence.admin?.name) {
            admin_name = licence.admin.name;
          }
        }

        // --- Preparar objeto POS ---
        return {
          city_name: pos.city || '',
          coordinates: pos.coordinates || '',
          province_name: pos.province || '',
          type_name: type_name!,
          subtype_name: subtype_name || undefined,
          zone_number: pos.zone || 0,
          agent_id_reference: pos.agent_id_reference || 0,
          area_name: pos.area || '',
          licence_reference: pos.licence || '',
          latitude: 1,
          longitude: 1,
          admin_name,
        };
      })
    );

    // --- Inserir tudo de uma vez ---
    await prisma.pos.createMany({
      data,
      skipDuplicates: true, // só funciona se existir índice único no modelo
    });
  }

  const count = batch.length;
  batch.length = 0;
  return count;
}
