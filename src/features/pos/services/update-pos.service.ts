import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { audit } from '../../../utils/audit-log';
import { AuthPayload, UpdatePosDTO } from '@lotaria-nacional/lotto';

interface UpdatePosServiceResponse {
  id: string;
}

export async function updatePosService(data: UpdatePosDTO & { user: AuthPayload }): Promise<UpdatePosServiceResponse> {
  const result = await prisma.$transaction(async (tx) => {
    const pos = await tx.pos.findUnique({ where: { id: data.id } });

    if (!pos) throw new NotFoundError('POS não encontrado.');

    if (data.agent_id_reference) {
      const agent = await tx.agent.findUnique({
        where: { id_reference: data.agent_id_reference },
      });

      if (!agent) {
        throw new NotFoundError('Agente não encontrado.');
      }

      await tx.agent.update({
        where: { id: agent.id },
        data: {
          status: 'active',
        },
      });
    }

    const posUpdated = await tx.pos.update({
      where: { id: data.id },
      data: {
        coordinates: data.coordinates,
        latitude: data.latitude,
        longitude: data.longitude,
        admin_name: data.admin_name,
        province_name: data.province_name,
        city_name: data.city_name,
        area_name: data.area_name,
        zone_number: data.zone_number,
        type_name: data.type_name,
        status: data.agent_id_reference ? 'active' : pos.status,
        subtype_name: data.subtype_name,
        agent_id_reference: data.agent_id_reference,
        licence_reference: data.licence_reference,
      },
    });

    await audit(tx, 'UPDATE', {
      user: data.user,
      entity: 'POS',
      before: pos,
      after: posUpdated,
    });

    return posUpdated.id;
  });

  return { id: result };
}
