import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { audit } from '../../../utils/audit-log';
import { AuthPayload, UpdatePosDTO } from '@lotaria-nacional/lotto';
import { createSlug } from '../../../utils/slug';

interface UpdatePosServiceResponse {
  id: string;
}

export async function updatePosService(data: UpdatePosDTO & { user: AuthPayload }): Promise<UpdatePosServiceResponse> {
  const result = await prisma.$transaction(async tx => {
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
        area_name: data.area_name,
        zone_number: data.zone_number,
        city_name: data.city_name ? createSlug(data.city_name) : pos.city_name,
        type_name: data.type_name ? createSlug(data.type_name) : pos.type_name,
        admin_name: data.admin_name ? createSlug(data.admin_name) : pos.admin_name,
        subtype_name: data.subtype_name ? createSlug(data.subtype_name) : pos.subtype_name,
        province_name: data.province_name ? createSlug(data.province_name) : pos.province_name,
        status: data.agent_id_reference ? 'active' : pos.status,
        agent_id_reference: data.agent_id_reference,
        licence_reference: data.licence_reference,
      },
    });

    await audit(tx, 'UPDATE', {
      user: data.user,
      entity: 'POS',
      before: pos,
      after: posUpdated,
      description: 'Atualizou os dados de um ponto de venda',
    });

    return posUpdated.id;
  });

  return { id: result };
}
