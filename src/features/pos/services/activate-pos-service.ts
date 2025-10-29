import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { BadRequestError, NotFoundError } from '../../../errors';
import { AuthPayload, LicenceStatus, PosStatus, UpdatePosDTO } from '@lotaria-nacional/lotto';

export async function activatePosService(data: UpdatePosDTO & { user: AuthPayload }) {
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

    if (data.licence_reference) {
      await associateLicenceToPos(tx, pos, data.licence_reference);
      hasLicence = true;
    }

    if (data.agent_id_reference) {
      await associateAgentToPos(tx, pos, data.agent_id_reference);
      hasAgent = true;
    }

    let newPosStatus: PosStatus = pos.status as any;

    if (hasAgent && hasLicence) {
      newPosStatus = 'active';
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

    let description = '';

    const addedAgent = data.agent_id_reference && !pos.agent_id_reference;
    const addedLicence = data.licence_reference && !pos.licence_reference;

    if (addedAgent && addedLicence) {
      description = 'Atribuiu um agente e uma licença ao Ponto de venda';
    } else if (addedAgent) {
      description = 'Atribuiu um agente ao Ponto de venda';
    } else if (addedLicence) {
      description = 'Atribuiu uma licença ao Ponto de venda';
    } else {
      description = 'Nenhuma atribuição nova feita ao Ponto de venda';
    }

    await audit(tx, 'ACTIVATE', {
      user: data.user,
      entity: 'POS',
      before: pos,
      after: posUpdated,
      description,
    });
  });
}

/**
 * LINK AGENT TO POS
 */
async function associateAgentToPos(tx: any, pos: any, agent_id_reference: number): Promise<void> {
  const existingPosAgent = pos.agent_id_reference;

  if (existingPosAgent && existingPosAgent !== agent_id_reference) {
    throw new BadRequestError('Este POS já está associado a outro agente');
  }

  const agent = await tx.agent.findUnique({
    where: { id_reference: agent_id_reference },
    include: { terminal: { select: { id: true, status: true } } },
  });

  if (!agent) throw new NotFoundError('Agente não encontrado');

  await tx.agent.update({
    where: { id_reference: agent_id_reference },
    data: {
      area: pos.area_name,
      zone: pos.zone_number?.toString(),
    },
  });

  // --- Ativar agente ---
  await tx.agent.update({
    where: { id_reference: agent_id_reference },
    data: { status: 'active' },
  });

  // --- Atualizar terminal do agente, se existir ---
  if (agent.terminal) {
    await tx.terminal.update({
      where: { id: agent.terminal.id },
      data: { status: 'on_field' },
    });
  }
}

/**
 * LINK LICENCE TO POS
 */
async function associateLicenceToPos(tx: any, pos: any, licence_reference: string): Promise<void> {
  if (pos.licence_reference && pos.licence_reference !== licence_reference) {
    throw new BadRequestError('Este POS já possui outra licença atribuída');
  }

  const licence = await tx.licence.findUnique({
    where: { reference: licence_reference },
    include: { pos: { select: { id: true } } },
  });

  if (!licence) throw new NotFoundError('Licença não encontrada');

  const posWithThisLicenceCount = licence.pos.length;
  const limitCount = licence.limit;

  if (posWithThisLicenceCount >= limitCount) {
    throw new BadRequestError('Esta licença atingiu o limite de uso');
  }

  // Determina novo status da licença (free ou used)
  const limitStatus: LicenceStatus =
    posWithThisLicenceCount + (pos.licence_reference ? 0 : 1) >= limitCount ? 'used' : 'free';

  await tx.licence.update({
    where: { reference: licence_reference },
    data: {
      status: limitStatus,
      ...(pos.licence_reference ? {} : { pos: { connect: { id: pos.id } } }),
    },
  });
}
