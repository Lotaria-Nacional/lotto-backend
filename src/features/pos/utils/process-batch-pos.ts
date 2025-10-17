import { PosStatus } from '@lotaria-nacional/lotto';
import prisma from '../../../lib/prisma';
import { BATCH_SIZE } from '../services/import-pos-sevice';
import { ImportPosDTO } from '../validation/import-pos-schema';

export async function processBatchPos(batch: ImportPosDTO[]) {
  for (let i = 0; i < batch.length; i += BATCH_SIZE) {
    const chunk = batch.slice(i, i + BATCH_SIZE);

    const { typeMap, subtypeMap, agentSet, licenceMap } = await collectData(chunk);
    const data = chunk.map((pos) => {
      let type_name: string | null = null;
      let subtype_name: string | null = null;

      if (pos.type_name) {
        if (typeMap.has(pos.type_name)) {
          type_name = pos.type_name;
        } else if (subtypeMap.has(pos.type_name)) {
          const subtype = subtypeMap.get(pos.type_name)!;
          subtype_name = subtype.name;
          type_name = subtype.type.name;
        }
      }

      const agent_id_reference =
        pos.agent_id_reference && agentSet.has(pos.agent_id_reference) ? pos.agent_id_reference : null;

      const admin_name = pos.licence ? licenceMap.get(pos.licence) || null : null;

      // converter status de string -> PosStatus
      let status: PosStatus | null = null;
      if (pos.status) {
        switch (pos.status.trim().toLowerCase()) {
          case 'active':
          case 'activo':
            status = 'active';
            break;
          case 'pending':
          case 'pendente':
            status = 'pending';
            break;
          case 'denied':
          case 'negado':
            status = 'denied';
            break;
          case 'discontinued':
          case 'descontinuado':
            status = 'discontinued';
            break;
          case 'approved':
          case 'aprovado':
            status = 'approved';
            break;
          default:
            status = 'pending';
        }
      }

      return {
        coordinates: pos.coordinates || null,
        latitude: 0,
        longitude: 0,
        province_name: pos.province || null,
        city_name: pos.city || null,
        area_name: pos.area || null,
        zone_number: pos.zone || null,
        status, // ✅ agora é PosStatus | null
        type_name,
        subtype_name,
        agent_id_reference,
        licence_reference: pos.licence || null,
        admin_name,
      };
    });

    try {
      await prisma.pos.createMany({
        data,
        skipDuplicates: true,
      });
    } catch (err: any) {
      console.error('Erro ao importar batch POS:', err);
    }
  }

  const count = batch.length;
  batch.length = 0;
  return count;
}

// --- FUNÇÃO PARA COLETAR DADOS AUXILIARES ---
async function collectData(chunk: ImportPosDTO[]) {
  const typeNames = Array.from(new Set(chunk.map((p) => p.type_name).filter(Boolean))) as string[];
  const agentIds = Array.from(new Set(chunk.map((p) => p.agent_id_reference).filter(Boolean))) as number[];
  const licenceRefs = Array.from(new Set(chunk.map((p) => p.licence).filter(Boolean))) as string[];
  const areaNames = Array.from(new Set(chunk.map((p) => p.area).filter(Boolean))) as string[];

  const [types, subtypes, agents, licences, areas] = await Promise.all([
    prisma.type.findMany({ where: { name: { in: typeNames } } }),
    prisma.subtype.findMany({
      where: { name: { in: typeNames } },
      include: { type: { select: { name: true } } },
    }),
    prisma.agent.findMany({
      where: { id_reference: { in: agentIds } },
      select: { id_reference: true },
    }),
    prisma.licence.findMany({
      where: { reference: { in: licenceRefs } },
      include: { admin: { select: { name: true } } },
    }),
    prisma.area.findMany({
      where: { name: { in: areaNames } },
      select: { name: true },
    }),
  ]);

  const typeMap = new Map(types.map((t) => [t.name, t.name]));
  const subtypeMap = new Map(subtypes.map((s) => [s.name, s]));
  const agentSet = new Set(agents.map((a) => a.id_reference));
  const licenceMap = new Map(licences.map((l) => [l.reference, l.admin?.name]));
  const areaSet = new Set(areas.map((a) => a.name));

  return { typeMap, subtypeMap, agentSet, licenceMap, areaSet };
}
