import prisma from '../../../lib/prisma';
import { PosStatus } from '@lotaria-nacional/lotto';
import { ImportPosDTO } from '../validation/import-pos-schema';
import { CHUNK_SIZE } from '../../agent/utils/process-batch-agents';
import { getAgent, getArea, getLicenceAndCity, getTypes, parseCoordinates } from './import-helpers';
import { generatePosID } from './generate-pos-id';

export async function processBatchPos(batch: ImportPosDTO[]) {
  if (batch.length === 0) return { count: 0, errors: [] };

  const errors: any[] = [];
  let processed = 0;

  console.log(batch);

  for (let i = 0; i < batch.length; i += CHUNK_SIZE) {
    const chunk = batch.slice(i, i + CHUNK_SIZE);

    for (const pos of chunk) {
      try {
        await prisma.$transaction(
          async tx => {
            const coords = parseCoordinates(pos.coordinates);

            const { typeExists, subTypeExists } = await getTypes({ tx, pos });
            const { areaExists, zoneExists } = await getArea({ tx, pos });
            const { adminExists, cityExists, licenceExists } = await getLicenceAndCity({ tx, pos });
            const { agentIdReference } = await getAgent({ tx, pos });

            let posStatus: PosStatus = agentIdReference ? 'active' : 'approved';

            if (agentIdReference) {
              await tx.agent.update({
                where: { id_reference: agentIdReference },
                data: {
                  area: areaExists,
                  zone: zoneExists?.toString(),
                },
              });
            }

            const pos_id = await generatePosID({
              tx,
              province: pos.province || 'luanda',
              area: areaExists || 'a',
              zone: zoneExists || 1,
            });

            console.log('POINT OF SALE CUSTOM ID: ', pos_id);

            const posData = {
              pos_id,
              city_name: cityExists,
              province_name: pos.province || 'luanda',
              area_name: areaExists,
              zone_number: zoneExists,
              description: pos.description,
              latitude: coords.latitude,
              longitude: coords.longitude,
              status: posStatus,
              type_name: typeExists,
              admin_name: adminExists,
              subtype_name: subTypeExists,
              coordinates: pos.coordinates,
              agent_id_reference: agentIdReference,
              licence_reference: licenceExists,
            };

            // Usa upsert atómico para evitar duplicados
            if (pos.id) {
              await tx.pos.upsert({
                where: { id: pos.id },
                update: posData,
                create: posData,
              });
            } else {
              await tx.pos.create({ data: posData });
            }
          },
          {
            isolationLevel: 'Serializable', // garante exclusividade
          }
        );

        processed++;
      } catch (err: any) {
        console.error(`PROCESS BATCH POS ERROR:`, err);
        errors.push({
          licence: pos.licence,
          error: err.message,
        });
      }
    }
  }

  return { count: processed, errors };
}
