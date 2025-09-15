import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { AuthPayload, LicenceStatus } from '@lotaria-nacional/lotto';
import { audit } from '../../../utils/audit-log';

export async function resetPosService(id: string, user: AuthPayload) {
  await prisma.$transaction(async tx => {
    const pos = await tx.pos.findUnique({
      where: {
        id,
      },
    });

    if (!pos) {
      throw new NotFoundError('POS não encontrado ');
    }

    if (pos.agent_id_reference) {
      const agent = await tx.agent.findUnique({
        where: { id_reference: pos.agent_id_reference },
        select: { id: true },
      });

      if (!agent) {
        throw new NotFoundError('Agente não encontrado');
      }

      await tx.agent.update({
        where: { id_reference: pos.agent_id_reference },
        data: {
          status: 'denied',
        },
      });
    }

    if (pos.licence_reference) {
      const licence = await tx.licence.findUnique({
        where: { id: pos.licence_reference },
        select: {
          id: true,
          limit: true,
          pos: { select: { id: true } },
        },
      });

      if (!licence) {
        throw new NotFoundError('Licencee não encontrado');
      }

      const posWithThisLicenceCount = licence.pos.length - 1; // -1 pq este POS vai ser removido
      const limitCount = licence.limit;

      const limitStatus: LicenceStatus = posWithThisLicenceCount >= limitCount ? 'used' : 'free';

      await tx.licence.update({
        where: { id: pos.licence_reference },
        data: {
          status: limitStatus,
        },
      });
    }

    const posUpdated = await tx.pos.update({
      where: {
        id: pos.id,
      },
      data: {
        status: 'pending',
        agent_id_reference: null,
        licence_reference: null,
      },
    });

    await audit(tx, 'RESET', {
      user: user,
      entity: 'POS',
      before: pos,
      after: posUpdated,
    });
  });
}
