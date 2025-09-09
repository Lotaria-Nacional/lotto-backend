import { licence } from './../../licence/@types/licence.t';
import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { RedisKeys } from '../../../utils/redis';
import { LicenceStatus } from '@lotaria-nacional/lotto';

export async function resetPosService(id: string) {
  await prisma.$transaction(async tx => {
    const pos = await tx.pos.findUnique({
      where: {
        id,
      },
    });

    if (!pos) {
      throw new NotFoundError('POS não encontrado ');
    }

    if (pos.agent_id) {
      const agent = await tx.agent.findUnique({
        where: { id: pos.agent_id },
        select: { id: true },
      });

      if (!agent) {
        throw new NotFoundError('Agente não encontrado');
      }

      await tx.agent.update({
        where: { id: pos.agent_id },
        data: {
          status: 'denied',
        },
      });
    }

    if (pos.licence_id) {
      const licence = await tx.licence.findUnique({
        where: { id: pos.licence_id },
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
        where: { id: pos.licence_id },
        data: {
          status: limitStatus,
        },
      });
    }

    await tx.pos.update({
      where: {
        id: pos.id,
      },
      data: {
        status: 'pending',
        agent_id: null,
        licence_id: null,
      },
    });
  });

  await Promise.all([
    RedisKeys.pos.all(),
    RedisKeys.agents.all(),
    RedisKeys.terminals.all(),
    RedisKeys.auditLogs.all(),
  ]);
}
