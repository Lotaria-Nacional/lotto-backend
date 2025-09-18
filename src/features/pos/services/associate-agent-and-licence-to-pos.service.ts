import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { BadRequestError, NotFoundError } from '../../../errors';
import { AuthPayload, LicenceStatus, PosStatus, TerminalStatus, UpdatePosDTO } from '@lotaria-nacional/lotto';

export async function associateAgentAndLicenceToPosService(data: UpdatePosDTO & { user: AuthPayload }) {
  await prisma.$transaction(async (tx) => {
    const pos = await tx.pos.findUnique({
      where: { id: data.id },
    });

    if (!pos) throw new NotFoundError('POS não encontrado');

    if (!data.licence_reference && !data.agent_id_reference) {
      throw new BadRequestError('É necessário fornecer licença ou agente para associar.');
    }

    let hasAgent = false;
    let hasLicence = false;
    let posUpdated = pos;

    // --- Associação de licença ---
    if (data.licence_reference) {
      if (pos.licence_reference && pos.licence_reference !== data.licence_reference) {
        throw new BadRequestError('Este POS já possui outra licença atribuída');
      }

      const licence = await tx.licence.findUnique({
        where: { reference: data.licence_reference },
        include: { pos: { select: { id: true } } },
      });

      if (!licence) throw new NotFoundError('Licença não encontrada');

      const posWithThisLicenceCount = licence.pos.length;
      const limitCount = licence.limit;

      if (posWithThisLicenceCount >= limitCount) {
        throw new BadRequestError('Esta licença atingiu o limite de uso');
      }

      const limitStatus: LicenceStatus =
        posWithThisLicenceCount + (pos.licence_reference ? 0 : 1) >= limitCount ? 'used' : 'free';

      await tx.licence.update({
        where: { reference: data.licence_reference },
        data: {
          status: limitStatus,
          ...(pos.licence_reference ? {} : { pos: { connect: { id: pos.id } } }),
          coordinates: `${pos.latitude},${pos.longitude}`,
        },
      });

      hasLicence = true;
    }

    // --- Associação de agente ---
    if (data.agent_id_reference) {
      if (pos.agent_id_reference && pos.agent_id_reference !== data.agent_id_reference) {
        throw new BadRequestError('Este POS já está associado a outro agente');
      }

      const agent = await tx.agent.findUnique({
        where: { id_reference: data.agent_id_reference },
        include: { terminal: { select: { id: true, status: true } } },
      });

      if (!agent) throw new NotFoundError('Agente não encontrado');

      await tx.agent.update({
        where: { id_reference: data.agent_id_reference },
        data: { status: 'active' },
      });

      // 🔹 Atualizar terminal do agente, se existir
      if (agent.terminal) {
        await tx.terminal.update({
          where: { id: agent.terminal.id },
          data: { status: 'on_field' },
        });
      }

      hasAgent = true;
    }

    // --- Decide status final do POS ---
    let newPosStatus: PosStatus = pos.status as any;

    if (hasAgent && hasLicence) {
      newPosStatus = 'active'; // 👈 prioridade para agente
    } else if (hasAgent) {
      newPosStatus = 'active';
    } else if (hasLicence) {
      newPosStatus = 'approved';
    }

    posUpdated = await tx.pos.update({
      where: { id: pos.id },
      data: {
        agent_id_reference: data.agent_id_reference ?? pos.agent_id_reference,
        licence_reference: data.licence_reference ?? pos.licence_reference,
        status: newPosStatus,
      },
    });

    // --- Audit log ---
    await audit(tx, 'ASSOCIATE', {
      user: data.user,
      entity: 'POS',
      before: pos,
      after: posUpdated,
    });
  });
}
