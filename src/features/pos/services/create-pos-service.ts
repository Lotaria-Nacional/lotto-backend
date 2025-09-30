import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { AuthPayload, CreatePosDTO } from '@lotaria-nacional/lotto';
import { createSlug } from '../../../utils/slug';

interface CreatePosServiceResponse {
  id: string;
}

export async function createPosService({
  user,
  ...data
}: CreatePosDTO & { user: AuthPayload }): Promise<CreatePosServiceResponse> {
  const response = await prisma.$transaction(async tx => {
    const posCreated = await tx.pos.create({
      data: {
        coordinates: data.coordinates,
        latitude: data.latitude!,
        longitude: data.longitude!,
        admin_name: createSlug(data.admin_name),
        province_name: createSlug(data.province_name),
        city_name: createSlug(data.city_name),
        area_name: data.area_name,
        zone_number: data.zone_number,
        type_name: data.type_name ? createSlug(data.type_name) : null,
        subtype_name: data.subtype_name ? createSlug(data.subtype_name) : null,
        agent_id_reference: data.agent_id_reference,
        licence_reference: data.licence_reference,
      },
    });

    await audit(tx, 'CREATE', {
      entity: 'POS',
      user,
      after: posCreated,
      before: null,
      description: 'Criou um ponto de venda',
    });

    return posCreated.id;
  });

  return { id: response };
}
