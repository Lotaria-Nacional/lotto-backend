import prisma from '../../../lib/prisma';
import { ImportPosDTO } from '../services/import-pos-sevice';
import { AuthPayload, PosStatus } from '@lotaria-nacional/lotto';
import { BadRequestError } from '../../../errors';

type ProcessPosBatchParams = {
  posList: ImportPosDTO[];
  user: AuthPayload;
  errors: any[];
};

export async function processPosBatch({ posList, user, errors }: ProcessPosBatchParams) {
  for (const posData of posList) {
    try {
      await prisma.$transaction(async (tx) => {
        // --- Coordenadas ---
        let latitude = 0;
        let longitude = 0;
        if (posData.coordenadas) {
          const [lat, lng] = posData.coordenadas.trim().split(',').map(Number);
          if (!isNaN(lat) && !isNaN(lng)) {
            latitude = lat;
            longitude = lng;
          }
        }

        // --- Validação de Tipologia ---
        let typeName: string | null = null;
        if (posData.tipologia) {
          const existingType = await tx.type.findUnique({
            where: { name: posData.tipologia },
            include: { subtypes: true },
          });

          if (existingType) {
            typeName = existingType.name;
          } else {
            const subtype = await tx.subtype.findUnique({
              where: { name: posData.tipologia },
              include: { type: true },
            });
            if (subtype) typeName = subtype.type.name;
          }
        }
        if (!typeName) throw new Error(`Tipologia inválida: ${posData.tipologia}`);

        // --- Criar POS (mesmo sem licença) ---
        const pos = await tx.pos.create({
          data: {
            coordinates: posData.coordenadas,
            admin_name: posData.administracao,
            province_name: posData.provincia,
            city_name: posData.cidade,
            area_name: posData.area,
            zone_number: posData.zona,
            type_name: typeName,
            latitude,
            longitude,
            status: 'pending',
            ...(posData.idRevendedor && posData.idRevendedor !== 0 ? { agent_id_reference: posData.idRevendedor } : {}),
          },
          include: {
            agent: { include: { terminal: true } },
            licence: true,
          },
        });

        let hasAgent = false;
        let hasLicence = false;

        // --- Associação de licença (opcional) ---
        if (posData.licenca) {
          const licence = await tx.licence.findUnique({
            where: { reference: posData.licenca },
            include: { pos: { select: { id: true } } },
          });

          if (licence) {
            const posWithThisLicenceCount = licence.pos.length;
            const limitCount = licence.limit;

            if (posWithThisLicenceCount < limitCount) {
              const limitStatus = posWithThisLicenceCount + 1 >= limitCount ? 'used' : 'free';

              await tx.licence.update({
                where: { reference: posData.licenca },
                data: {
                  status: limitStatus,
                  pos: { connect: { id: pos.id } },
                },
              });

              hasLicence = true;
            } else {
              throw new BadRequestError(`Licença ${posData.licenca} atingiu o limite de uso`);
            }
          }
        }

        // --- Associação de agente (opcional) ---
        if (posData.idRevendedor) {
          const agent = await tx.agent.findUnique({
            where: { id_reference: posData.idRevendedor },
            include: { terminal: { select: { id: true, status: true } } },
          });

          if (agent) {
            // Atualizar terminal, se existir
            if (agent.terminal) {
              await tx.terminal.update({
                where: { id: agent.terminal.id },
                data: { status: 'on_field' },
              });
            }

            // Atualizar status do agente
            await tx.agent.update({
              where: { id_reference: agent.id_reference ?? undefined },
              data: { status: 'active' },
            });

            hasAgent = true;
          }
          // Se não encontrar agente → apenas ignora, POS continua criado sem agente
        }

        // --- Determinar status final ---
        let newPosStatus: PosStatus = 'active';
        if (hasAgent && hasLicence) newPosStatus = 'active';
        else if (hasAgent) newPosStatus = 'active';
        else if (hasLicence) newPosStatus = 'approved';

        await tx.pos.update({
          where: { id: pos.id },
          data: { status: newPosStatus },
        });
      });
    } catch (err: any) {
      errors.push({ row: posData, error: err.message || err });
    }
  }
}
