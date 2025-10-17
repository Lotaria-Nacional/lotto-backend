import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { AuthPayload, CreatePosDTO } from '@lotaria-nacional/lotto';

interface CreatePosServiceResponse {
  id: string;
}

export async function createPosService({
  user,
  ...data
}: CreatePosDTO & { user: AuthPayload }): Promise<CreatePosServiceResponse> {
  const response = await prisma.$transaction(async (tx) => {
    let licence;
    if (data.licence_reference) {
      licence = await tx.licence.findUnique({
        where: {
          reference: data.licence_reference,
        },
        include: { admin: { select: { name: true } } },
      });
    }

    const posCreated = await tx.pos.create({
      data: {
        coordinates: data.coordinates,
        latitude: data.latitude!,
        admin_name: licence?.admin_name,
        longitude: data.longitude!,
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
      description: 'Criou um ponto de venda',
    });

    return posCreated.id;
  });

  return { id: response };
}
