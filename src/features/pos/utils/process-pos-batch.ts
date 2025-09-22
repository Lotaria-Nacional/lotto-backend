import prisma from '../../../lib/prisma';
import { BadRequestError, NotFoundError } from '../../../errors';
import { AuthPayload, CreatePosDTO, PosStatus } from '@lotaria-nacional/lotto';

type ProcessPosBatchParams = {
  posList: CreatePosDTO[]; // array de CreatePosDTO com possíveis referências de agente/licença
  user: AuthPayload;
  errors: any[];
};

export async function processPosBatch({ posList, user, errors }: ProcessPosBatchParams) {
  for (const posData of posList) {
    try {
      await prisma.$transaction(async (tx) => {
        // --- Criar POS ---

        console.log({
          coord: posData.coordinates,
          lat: posData.latitude,
          lng: posData.longitude,
        });

        const pos = await tx.pos.create({
          data: {
            ...posData,
            latitude: posData.latitude!,
            longitude: posData.longitude!,
            status: 'pending', // status inicial
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
        if (posData.licence_reference) {
          const licence = await tx.licence.findUnique({
            where: { reference: posData.licence_reference },
            include: { pos: { select: { id: true } } },
          });
          if (!licence) throw new NotFoundError(`Licença ${posData.licence_reference} não encontrada`);

          const posWithThisLicenceCount = licence.pos.length;
          const limitCount = licence.limit;

          if (posWithThisLicenceCount >= limitCount) {
            throw new BadRequestError(`Licença ${posData.licence_reference} atingiu o limite de uso`);
          }

          const limitStatus = posWithThisLicenceCount + (pos.licence_reference ? 0 : 1) >= limitCount ? 'used' : 'free';

          await tx.licence.update({
            where: { reference: posData.licence_reference },
            data: {
              status: limitStatus,
              ...(pos.licence_reference ? {} : { pos: { connect: { id: pos.id } } }),
            },
          });

          hasLicence = true;
        }

        // --- Associação de agente ---
        if (posData.agent_id_reference) {
          const agent = await tx.agent.findUnique({
            where: { id_reference: posData.agent_id_reference },
            include: { terminal: { select: { id: true, status: true } } },
          });
          if (!agent) throw new NotFoundError(`Agente ${posData.agent_id_reference} não encontrado`);

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
        // await audit(tx, 'IMPORT', {
        //   user,
        //   entity: 'POS',
        //   before: null,
        //   after: pos,
        // });
      });
    } catch (err: any) {
      errors.push({ row: posData, error: err.message || err });
    }
  }
}
