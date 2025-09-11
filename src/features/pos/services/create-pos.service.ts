import { AuthPayload, CreatePosDTO } from '@lotaria-nacional/lotto';
import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';

export async function createPosService({ user, ...data }: CreatePosDTO & { user: AuthPayload }) {
  const response = await prisma.$transaction(async tx => {
    const posCreated = await tx.pos.create({
      data: {
        latitude: data.latitude,
        longitude: data.longitude,
        admin_id: data.admin_id,
        province_id: data.province_id,
        city_id: data.city_id,
        area_id: data.area_id,
        zone_id: data.zone_id,
        type_id: data.type_id,
        subtype_id: data.subtype_id,
        agent_id: data.agent_id,
        licence_id: data.licence_id,
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
