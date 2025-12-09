import prisma from '../../../lib/prisma';
import { generatePosID } from './generate-pos-id';
import { PosStatus } from '@lotaria-nacional/lotto';
import { ImportPosDTO } from '../validation/import-pos-schema';
import { CHUNK_SIZE } from '../../agent/utils/process-batch-agents';
import { getAgent, getArea, getLicenceAndCity, getTypes, parseCoordinates } from './import-helpers';

export async function processBatchPos(batch: ImportPosDTO[]) {
  if (!batch || batch.length === 0) {
    return { count: 0, errors: [] };
  }

  const errors: Array<{ licence: string | null; error: string }> = [];
  let processed = 0;

  for (let i = 0; i < batch.length; i += CHUNK_SIZE) {
    const chunk = batch.slice(i, i + CHUNK_SIZE);

    for (const pos of chunk) {
      try {
        await prisma.$transaction(
          async tx => {
            // 1. Parse coordenadas
            const coords = parseCoordinates(pos.coordinates);

            // 2. Fetch de tipos e auxiliares
            const { typeExists, subTypeExists } = await getTypes({ tx, pos });
            const { areaExists, zoneExists } = await getArea({ tx, pos });
            const { adminExists, cityExists, licenceExists } = await getLicenceAndCity({ tx, pos });

            // 3. Processar agente (desassocia POS antigo e muda status do terminal para 'delivered')
            const { agentIdReference } = await getAgent({ tx, pos });

            // 4. Status do POS
            const status: PosStatus = agentIdReference ? 'active' : 'approved';

            // 5. Atualizar o agente com área e zona
            if (agentIdReference) {
              await tx.agent.update({
                where: { id_reference: agentIdReference },
                data: {
                  area: areaExists ?? null,
                  zone: zoneExists?.toString() ?? null,
                },
              });
            }

            // 6. Gerar POS ID se não existir
            const generatedPosId =
              pos.pos_id ||
              (await generatePosID({
                tx,
                province: pos.province || 'luanda',
                area: areaExists || 'a',
                zone: zoneExists || 1,
              }));

            // 7. Construção do objecto POS
            const posData = {
              pos_id: generatedPosId,
              city_name: cityExists,
              province_name: pos.province || 'luanda',
              area_name: areaExists,
              zone_number: zoneExists,
              description: pos.description || null,
              latitude: coords.latitude,
              longitude: coords.longitude,
              status,
              type_name: typeExists,
              admin_name: adminExists,
              subtype_name: subTypeExists,
              coordinates: pos.coordinates,
              agent_id_reference: agentIdReference, // Associa o novo agente ao POS
              licence_reference: licenceExists,
            };

            // 8. Upsert do POS
            await tx.pos.upsert({
              where: { pos_id: generatedPosId },
              update: posData,
              create: posData,
            });

            // 9. Atualizar o terminal do agente atual para 'on_field'
            if (agentIdReference) {
              const agentWithTerminal = await tx.agent.findUnique({
                where: { id_reference: agentIdReference },
                select: { terminal: { select: { id: true } } },
              });

              if (agentWithTerminal?.terminal?.id) {
                await tx.terminal.update({
                  where: { id: agentWithTerminal.terminal.id },
                  data: { status: 'on_field' },
                });
              }
            }
          },
          {
            isolationLevel: 'Serializable',
            timeout: 10_000,
          }
        );

        processed++;
      } catch (err: any) {
        console.error(`PROCESS BATCH POS ERROR:`, {
          licence: pos.licence,
          message: err?.message,
          stack: err?.stack,
        });

        errors.push({
          licence: pos.licence ?? null,
          error: err.message ?? 'Erro desconhecido',
        });
      }
    }
  }

  return { count: processed, errors };
}
