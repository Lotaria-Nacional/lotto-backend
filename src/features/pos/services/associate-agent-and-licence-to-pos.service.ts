import prisma from '../../../lib/prisma';
import { BadRequestError, NotFoundError } from '../../../errors';
import { RedisKeys } from '../../../utils/redis';
import { LicenceStatus, UpdatePosDTO } from '@lotaria-nacional/lotto';

export async function associateAgentAndLicenceToPosService(data: UpdatePosDTO) {
  await prisma.$transaction(async tx => {
    const pos = await tx.pos.findUnique({
      where: {
        id: data.id,
      },
    });

    if (!pos) {
      throw new NotFoundError('POS não encontrado ');
    }

    if (data.licence_id) {
      const licence = await tx.licence.findUnique({
        where: { id: data.licence_id },
        include: { pos: { select: { id: true } } },
      });

      if (!licence) {
        throw new NotFoundError('Licencee não encontrado');
      }

      const posWithThisLicenceCount = licence.pos.length;
      const limitCount = licence.limit;
      const hasReachedTheLimit = posWithThisLicenceCount >= limitCount;

      if (hasReachedTheLimit) {
        throw new BadRequestError('Esta licença atingiu o limite de uso');
      }

      const limitStatus: LicenceStatus = posWithThisLicenceCount + 1 >= limitCount ? 'used' : 'free';

      await tx.licence.update({
        where: { id: data.licence_id },
        data: {
          status: limitStatus,
          pos: {
            connect: {
              id: pos.id,
            },
          },
        },
      });
    }

    if (data.agent_id) {
      if (data.agent_id !== pos.agent_id) {
        throw new BadRequestError('Este POS já está ocupado');
      }

      const agent = await tx.agent.findUnique({
        where: { id: pos.agent_id },
        include: {
          terminal: { select: { id: true } },
        },
      });

      if (!agent) {
        throw new NotFoundError('Agente não encontrado');
      }

      await tx.agent.update({
        where: { id: pos.agent_id },
        data: {
          status: agent.terminal ? 'active' : agent.status,
        },
      });
    }

    await tx.pos.update({
      where: {
        id: pos.id,
      },
      data: {
        status: 'active',
        agent_id: data.agent_id,
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
