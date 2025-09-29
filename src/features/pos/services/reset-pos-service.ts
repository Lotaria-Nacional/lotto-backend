import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { audit } from '../../../utils/audit-log';
import { AuthPayload, LicenceStatus } from '@lotaria-nacional/lotto';

export async function resetPosService(id: string, user: AuthPayload) {
  await prisma.$transaction(async tx => {
    const pos = await tx.pos.findUnique({
      where: { id },
    });

    if (!pos) throw new NotFoundError('POS não encontrado');

    // Resetar agente
    if (pos.agent_id_reference) {
      const agent = await tx.agent.findUnique({
        where: { id_reference: pos.agent_id_reference },
        select: {
          id: true,
          terminal: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      });

      if (!agent) throw new NotFoundError('Agente não encontrado');

      if (agent.terminal) {
        await tx.terminal.update({
          where: { id: agent.terminal.id },
          data: { status: 'ready' },
        });
      }

      await tx.agent.update({
        where: { id_reference: pos.agent_id_reference },
        data: { status: 'ready' }, // 👈 fica ready em vez de denied
      });
    }

    // Resetar licença
    if (pos.licence_reference) {
      const licence = await tx.licence.findUnique({
        where: { reference: pos.licence_reference },
        select: {
          id: true,
          limit: true,
          status: true,
          pos: { select: { id: true } },
        },
      });

      if (!licence) throw new NotFoundError('Licença não encontrada');

      const posWithThisLicenceCount = licence.pos.length - 1; // -1 pq este POS será removido
      const limitCount = licence.limit;

      let newLicenceStatus: LicenceStatus = licence.status;

      // Se o limite estava estourado e agora liberou, volta para "free"
      if (licence.status === 'used' && posWithThisLicenceCount < limitCount) {
        newLicenceStatus = 'free';
      }

      await tx.licence.update({
        where: { reference: pos.licence_reference },
        data: { status: newLicenceStatus },
      });
    }

    // Resetar POS
    const posUpdated = await tx.pos.update({
      where: { id: pos.id },
      data: {
        status: 'approved',
        agent_id_reference: null,
        licence_reference: null,
      },
    });

    // Audit
    await audit(tx, 'RESET', {
      user,
      entity: 'POS',
      before: pos,
      after: posUpdated,
      description: 'Resetou um ponto de venda',
    });
  });
}
