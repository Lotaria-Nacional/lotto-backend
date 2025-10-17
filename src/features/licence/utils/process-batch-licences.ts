import { LicenceStatus } from '@lotaria-nacional/lotto';
import prisma from '../../../lib/prisma';
import { CHUNK_SIZE } from '../../agent/utils/process-batch-agents';
import { ImportLicenceDTO } from '../validation/import-licence-schema';

export async function processBatchLicences(batch: ImportLicenceDTO[]) {
  for (let i = 0; i < batch.length; i += CHUNK_SIZE) {
    const chunk = batch.slice(i, i + CHUNK_SIZE);

    await prisma.$transaction(
      chunk.map(licence => {
        const coords = {
          latitude: 0,
          longitude: 0,
        };
        if (licence.coordinates) {
          const [lat, lng] = licence.coordinates.trim().split(',').map(Number);
          coords.latitude = lat;
          coords.longitude = lng;
        }

        const licenceData = {
          admin_name: licence.admin_name,
          coordinates: licence.coordinates,
          description: licence.description,
          emitted_at: licence.emitted_at ?? new Date(),
          expires_at: licence.expires_at ?? new Date(),
          limit: licence.limit,
          district: licence.district,
          number: licence.number,
          reference: licence.reference,
          status: 'free' as LicenceStatus,
          latitude: coords.latitude,
          longitude: coords.longitude,
        };

        return prisma.licence.upsert({
          where: { reference: licenceData.reference },
          create: {
            ...licenceData,
            admin_name: licenceData.admin_name ?? undefined,
          },
          update: {
            ...licenceData,
            admin_name: licenceData.admin_name ?? undefined,
          },
        });
      })
    );
  }

  const count = batch.length;
  batch.length = 0;
  return count;
}
