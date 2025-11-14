import path from 'node:path';
import imageKit from '../../../lib/image-kit';
import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { generatePosID } from '../utils/generate-pos-id';
import { AuthPayload, CreatePosDTO } from '@lotaria-nacional/lotto';
import { createReadStream } from 'node:fs';

export async function createPosService({
  user,
  file,
  ...data
}: CreatePosDTO & { description?: string; user: AuthPayload; file?: Express.Multer.File }) {
  try {
    await prisma.$transaction(async tx => {
      const posID = await generatePosID({
        tx,
        province: data.province_name,
        area: data.area_name || 'a',
        zone: data.zone_number || 1,
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

      let image = null;
      if (file) {
        const result = await imageKit.files.upload({
          file: createReadStream(file.path),
          fileName: file.originalname,
          folder: '/pos',
        });
        image = result.url;
      }

      const posCreated = await tx.pos.create({
        data: {
          pos_id: posID,
          coordinates: data.coordinates,
          latitude: data.latitude!,
          image,
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
  } catch (error) {
    console.log('[ERROR: CREATE POS SERVICE ]');
    console.log(error);
  }
}
