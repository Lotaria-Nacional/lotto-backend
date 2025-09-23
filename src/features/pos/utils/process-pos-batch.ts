import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { ImportPosDTO } from '../services/import-pos-sevice';
import { AuthPayload, PosStatus } from '@lotaria-nacional/lotto';
import { BadRequestError, NotFoundError } from '../../../errors';

type ProcessPosBatchParams = {
  posList: ImportPosDTO[];
  user: AuthPayload;
  errors: any[];
};

export async function processPosBatch({ posList, user, errors }: ProcessPosBatchParams) {
  for (const posData of posList) {
    try {
      await prisma.$transaction(async (tx) => {
        // --- Criar POS ---
        let latitude = 0;
        let longitude = 0;

        if (posData.coordenadas) {
          const [lat, lng] = posData.coordenadas.trim().split(',').map(Number);
          latitude = lat;
          longitude = lng;
        }

        let typeName: string | null = null;

        if (posData.tipologia) {
          // 1. Verifica se é um type
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

            if (subtype) {
              typeName = subtype.type.name;
            }
          }
        }

        if (!typeName) {
          throw new Error(`Tipologia inválida: ${posData.tipologia}`);
        }

        const pos = await tx.pos.create({
          data: {
            agent_id_reference: posData.idRevendedor,
            coordinates: posData.coordenadas,
            admin_name: posData.administracao,
            province_name: posData.provincia,
            city_name: posData.cidade,
            area_name: posData.area,
            zone_number: posData.zona,
            type_name: typeName,
            licence_reference: posData.licenca,
            latitude,
            longitude,
            status: 'pending',
          },
          include: {
            agent: { include: { terminal: true } },
            licence: true,
          },
        });

        let hasAgent = false;
        let hasLicence = false;
        let newPosStatus: PosStatus = 'pending';

        // --- Associação de licença ---
        if (posData.licenca) {
          const licence = await tx.licence.findUnique({
            where: { reference: posData.licenca },
            include: { pos: { select: { id: true } } },
          });

          if (!licence) throw new NotFoundError(`Licença ${posData.licenca} não encontrada`);

          const posWithThisLicenceCount = licence.pos.length;
          const limitCount = licence.limit;

          if (posWithThisLicenceCount >= limitCount) {
            throw new BadRequestError(`Licença ${posData.licenca} atingiu o limite de uso`);
          }

          const limitStatus = posWithThisLicenceCount + (pos.licence_reference ? 0 : 1) >= limitCount ? 'used' : 'free';

          await tx.licence.update({
            where: { reference: posData.licenca },
            data: {
              status: limitStatus,
              ...(pos.licence_reference ? {} : { pos: { connect: { id: pos.id } } }),
            },
          });

          hasLicence = true;
        }

        // --- Associação de agente ---
        if (posData.idRevendedor) {
          const agent = await tx.agent.findUnique({
            where: { id_reference: posData.idRevendedor },
            include: { terminal: { select: { id: true, status: true } } },
          });
          if (!agent) throw new NotFoundError(`Agente ${posData.idRevendedor} não encontrado`);

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

        // --- Determinar status final do POS ---
        if (hasAgent && hasLicence) newPosStatus = 'active';
        else if (hasAgent) newPosStatus = 'active';
        else if (hasLicence) newPosStatus = 'approved';

        await tx.pos.update({
          where: { id: pos.id },
          data: { status: newPosStatus },
        });

        // // --- Audit log ---
        await audit(tx, 'IMPORT', {
          user,
          entity: 'POS',
          before: null,
          after: null,
        });
      });
    } catch (err: any) {
      errors.push({ row: posData, error: err.message || err });
    }
  }
}
