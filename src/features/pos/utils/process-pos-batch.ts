import prisma from '../../../lib/prisma';
import { AuthPayload, PosStatus } from '@lotaria-nacional/lotto';
import { ImportPosDTO } from '../validation/import-pos-schema';

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
        let latitude: number | null = null;
        let longitude: number | null = null;
        if (posData.coordinates) {
          const [lat, lng] = posData.coordinates.trim().split(',').map(Number);
          if (!isNaN(lat) && !isNaN(lng)) {
            latitude = lat;
            longitude = lng;
          }
        }

        // --- Validação de Tipologia ---
        let typeName: string | null = null;
        if (posData.type_name) {
          const existingType = await tx.type.findUnique({
            where: { name: posData.type_name },
            include: { subtypes: true },
          });

          if (existingType) {
            typeName = existingType.name;
          } else {
            const subtype = await tx.subtype.findUnique({
              where: { name: posData.type_name },
              include: { type: true },
            });
            if (subtype) typeName = subtype.type.name;
          }
        }

        // --- Definir dados base do POS (sem agent nem licence ainda) ---
        const posDataToSave = {
          coordinates: posData.coordinates ?? null,
          admin_name: posData.admin_name ?? null,
          province_name: posData.province ?? null,
          city_name: posData.city ?? null,
          area_name: posData.area ?? null,
          zone_number: posData.zone ?? null,
          type_name: typeName ?? null,
          latitude,
          longitude,
          status: 'pending' as PosStatus,
        };

        // --- Encontrar POS existente (por agent_id_reference ou licence_reference) ---
        let existingPos = null;
        if (posData.agent_id_reference && posData.agent_id_reference !== 0) {
          existingPos = await tx.pos.findUnique({
            where: { agent_id_reference: posData.agent_id_reference },
          });
        }
        if (!existingPos && posData.licence) {
          existingPos = await tx.pos.findFirst({
            where: { licence_reference: posData.licence },
          });
        }

        // --- Criar ou atualizar POS ---
        const pos = existingPos
          ? await tx.pos.update({
              where: { id: existingPos.id },
              data: posDataToSave,
              include: {
                agent: { include: { terminal: true } },
                licence: true,
              },
            })
          : await tx.pos.create({
              data: posDataToSave,
              include: {
                agent: { include: { terminal: true } },
                licence: true,
              },
            });

        let hasAgent = false;
        let hasLicence = false;

        // --- Associação de licença (opcional) ---
        if (posData.licence) {
          const licence = await tx.licence.findUnique({
            where: { reference: posData.licence },
            include: { pos: { select: { id: true } } },
          });

          if (licence) {
            const posWithThisLicenceCount = licence.pos.length;
            const limitCount = licence.limit;

            if (posWithThisLicenceCount < limitCount || existingPos) {
              const limitStatus = posWithThisLicenceCount + (existingPos ? 0 : 1) >= limitCount ? 'used' : 'free';

              await tx.licence.update({
                where: { reference: posData.licence },
                data: {
                  status: limitStatus,
                  pos: { connect: { id: pos.id } },
                },
              });

              hasLicence = true;

              // ✅ Atualiza POS com licence_reference
              await tx.pos.update({
                where: { id: pos.id },
                data: { licence_reference: posData.licence },
              });
            }
          }
        }

        // --- Associação de agente (opcional) ---
        if (posData.agent_id_reference) {
          const agent = await tx.agent.findUnique({
            where: { id_reference: posData.agent_id_reference },
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

            // ✅ Só agora associa o agent_id_reference ao POS
            await tx.pos.update({
              where: { id: pos.id },
              data: { agent_id_reference: agent.id_reference },
            });

            hasAgent = true;
          }
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
