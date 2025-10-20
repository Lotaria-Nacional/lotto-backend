import prisma from '../../../lib/prisma';
import { LicenceStatus } from '@lotaria-nacional/lotto';
import { CHUNK_SIZE } from '../../agent/utils/process-batch-agents';
import { ImportLicenceDTO } from '../validation/import-licence-schema';

export async function processBatchLicences(batch: ImportLicenceDTO[]) {
  for (let i = 0; i < batch.length; i += CHUNK_SIZE) {
    const chunk = batch.slice(i, i + CHUNK_SIZE);

    try {
      await prisma.$transaction(async tx => {
        for (const licence of chunk) {
          const coords = {
            latitude: 0,
            longitude: 0,
          };

          if (licence.coordinates) {
            const [lat, lng] = licence.coordinates.trim().split(',').map(Number);
            coords.latitude = lat;
            coords.longitude = lng;
          }

          let adminExists = null;
          if (licence.admin_name) {
            const admin = await tx.administration.findUnique({
              where: { name: licence.admin_name },
              select: { name: true },
            });
            adminExists = admin ? admin.name : undefined;
          }

          const licenceData = {
            admin_name: licence.admin_name,
            coordinates: licence.coordinates,
            description: licence.description,
            emitted_at: licence.emitted_at ?? new Date(),
            expires_at: licence.expires_at ?? new Date(),
            limit: licence.limit || 50,
            district: licence.district,
            number: licence.number,
            reference: licence.reference,
            status: 'free' as LicenceStatus,
            latitude: coords.latitude,
            longitude: coords.longitude,
          };

          const data = {
            ...licenceData,
            admin_name: adminExists,
          };

          await tx.licence.upsert({
            where: { reference: licenceData.reference },
            create: data,
            update: data,
          });
        }
      });
    } catch (error) {
      console.error(`PROCESS BATCH LICENCES ERROR: ${error}`);
    }
  }

  const count = batch.length;
  batch.length = 0;
  return count;
}
