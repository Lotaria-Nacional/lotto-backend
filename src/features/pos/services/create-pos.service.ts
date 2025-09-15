import { AuthPayload, CreatePosDTO } from '@lotaria-nacional/lotto';
import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';

export async function createPosService({ user, ...data }: CreatePosDTO & { user: AuthPayload }) {
  const response = await prisma.$transaction(async tx => {
    const posCreated = await tx.pos.create({
      data: {
        latitude: data.latitude,
        longitude: data.longitude,
        admin_name: data.admin_name,
        province_name: data.province_name,
        city_name: data.city_name,
        area_name: data.area_name,
        zone_number: data.zone_number,
        type_name: data.type_name,
        subtype_name: data.subtype_name,
        agent_id_reference: data.agent_id_reference,
        licence_reference: data.licence_reference,
      },
    });

    await audit(tx, 'CREATE', {
      entity: 'POS',
      user,
      after: posCreated,
      before: null,
    });

    return posCreated.id;
  });

  return response;
}
