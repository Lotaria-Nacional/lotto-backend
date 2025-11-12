import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { generatePosID } from '../utils/generate-pos-id';
import { AuthPayload, CreatePosDTO } from '@lotaria-nacional/lotto';

interface CreatePosServiceResponse {
  id: string;
}

export async function createPosService({
  user,
  ...data
}: CreatePosDTO & { description?: string; user: AuthPayload }): Promise<CreatePosServiceResponse> {
  const response = await prisma.$transaction(async tx => {
    const posID = await generatePosID({
      tx,
      province: data.province_name,
      area: data.area_name!,
      zone: data.zone_number!,
    });

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
        pos_id: posID,
        coordinates: data.coordinates,
        latitude: data.latitude!,
        admin_name: licence?.admin_name,
        description: data.description,
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
