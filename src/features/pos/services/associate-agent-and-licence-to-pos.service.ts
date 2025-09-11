import prisma from '../../../lib/prisma';
import { BadRequestError, NotFoundError } from '../../../errors';
import { AuthPayload, LicenceStatus, UpdatePosDTO } from '@lotaria-nacional/lotto';
import { audit } from '../../../utils/audit-log';

export async function associateAgentAndLicenceToPosService(data: UpdatePosDTO & { user: AuthPayload }) {
  await prisma.$transaction(async tx => {
    const pos = await tx.pos.findUnique({
      where: {
        id: data.id,
      },
    });

    if (!pos) {
      throw new NotFoundError('POS não encontrado ');
    }

    let posUpdated;

    if (data.licence_id) {
      if (pos.licence_id && pos.licence_id !== data.licence_id) {
        throw new BadRequestError('Este POS já possui outra licença atribuída');
      }

      const licence = await tx.licence.findUnique({
        where: { id: data.licence_id },
        include: { pos: { select: { id: true } } },
      });

      if (!licence) {
        throw new NotFoundError('Licença não encontrada');
      }

      const posWithThisLicenceCount = licence.pos.length;
      const limitCount = licence.limit;

      if (posWithThisLicenceCount >= limitCount) {
        throw new BadRequestError('Esta licença atingiu o limite de uso');
      }

      const limitStatus: LicenceStatus =
        posWithThisLicenceCount + (pos.licence_id ? 0 : 1) >= limitCount ? 'used' : 'free';

      await tx.licence.update({
        where: { id: data.licence_id },
        data: {
          status: limitStatus,
          ...(pos.licence_id ? {} : { pos: { connect: { id: pos.id } } }),
          coordinates: `${pos.latitude},${pos.longitude}}`,
        },
      });

      posUpdated = await tx.pos.update({
        where: { id: data.id },
        data: {
          status: 'approved',
        },
      });
    }

    if (data.agent_id) {
      if (pos.agent_id && pos.agent_id !== data.agent_id) {
        throw new BadRequestError('Este POS já está associado a outro agente');
      }

      const agent = await tx.agent.findUnique({
        where: { id: data.agent_id },
        include: {
          terminal: { select: { id: true } },
        },
      });

      if (!agent) {
        throw new NotFoundError('Agente não encontrado');
      }

      await tx.agent.update({
        where: { id: data.agent_id },
        data: {
          status: agent.terminal ? 'active' : agent.status,
        },
      });

      posUpdated = await tx.pos.update({
        where: { id: pos.id },
        data: {
          agent_id: data.agent_id,
          status: 'active',
        },
      });

      await audit(tx, 'ASSOCIATE', {
        user: data.user,
        entity: 'POS',
        after: posUpdated,
        before: pos,
      });
    }
  });
}
