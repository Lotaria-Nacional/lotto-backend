import { Prisma } from '@prisma/client';
import prisma from '../../../lib/prisma';
import { ImportPosDTO } from '../validation/import-pos-schema';

// --- FUNÇÃO PARA COLETAR DADOS AUXILIARES ---
export async function collectData(chunk: ImportPosDTO[]) {
  const typeNames = Array.from(new Set(chunk.map(p => p.type_name).filter(Boolean))) as string[];
  const agentIds = Array.from(new Set(chunk.map(p => p.agent_id_reference).filter(Boolean))) as number[];
  const licenceRefs = Array.from(new Set(chunk.map(p => p.licence).filter(Boolean))) as string[];
  const areaNames = Array.from(new Set(chunk.map(p => p.area).filter(Boolean))) as string[];

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

  const typeMap = new Map(types.map(t => [t.name, t.name]));
  const subtypeMap = new Map(subtypes.map(s => [s.name, s]));
  const agentSet = new Set(agents.map(a => a.id_reference));
  const licenceMap = new Map(licences.map(l => [l.reference, l.admin?.name]));
  const areaSet = new Set(areas.map(a => a.name));

  return { typeMap, subtypeMap, agentSet, licenceMap, areaSet };
}

type GetReferenceProp = {
  tx: Prisma.TransactionClient;
  pos: ImportPosDTO;
};

export const getTypes = async ({ pos, tx }: GetReferenceProp) => {
  let typeExists = null;
  let subTypeExists = null;

  if (pos.type_name) {
    const type = await tx.type.findUnique({
      where: { name: pos.type_name },
    });

    if (type) {
      typeExists = type.name;
    } else {
      const subtype = await tx.subtype.findUnique({
        where: { name: pos.type_name },
        include: { type: { select: { name: true } } },
      });

      if (subtype) {
        subTypeExists = subtype.name;
        typeExists = subtype.type.name;
      }
    }
  }

  return { typeExists, subTypeExists };
};

export const getArea = async ({ pos, tx }: GetReferenceProp) => {
  let areaExists = null;
  let zoneExists = null;

  if (pos.area) {
    const area = await tx.area.findUnique({
      where: { name: pos.area },
      select: { name: true },
    });
    areaExists = area ? area.name : undefined;
  }

  if (pos.zone) {
    const zone = await tx.zone.findUnique({
      where: { number: pos.zone },
      select: { number: true },
    });
    zoneExists = zone ? zone.number : undefined;
  }

  return {
    areaExists,
    zoneExists,
  };
};

export const getLicenceAndCity = async ({ pos, tx }: GetReferenceProp) => {
  let licenceExists = null;
  let adminExists = null;
  let cityExists = null;

  if (pos.city) {
    const city = await tx.city.findUnique({
      where: { name: pos.city },
      select: { name: true },
    });
    cityExists = city ? city.name : undefined;
  }

  if (pos.licence) {
    const licence = await tx.licence.findUnique({
      where: { reference: pos.licence },
      select: { reference: true, admin_name: true },
    });
    licenceExists = licence ? licence.reference : undefined;
    adminExists = licence?.admin_name ? licence.admin_name : undefined;
  }

  return {
    licenceExists,
    adminExists,
    cityExists,
  };
};

export const getAgent = async ({ pos, tx }: GetReferenceProp) => {
  let agentIdReference: number | null = null;

  if (pos.agent_id_reference) {
    // 1. Buscar o agente com POS e terminal já existentes
    const agent = await tx.agent.findUnique({
      where: { id_reference: pos.agent_id_reference },
      select: {
        id_reference: true,
        pos: { select: { id: true } },
        terminal: { select: { id: true } },
      },
    });

    if (agent) {
      agentIdReference = agent.id_reference;

      // 2. Se o agente já tiver POS associado, desassociar
      if (agent.pos?.id) {
        await tx.pos.update({
          where: { id: agent.pos.id },
          data: {
            agent_id_reference: null,
            status: 'approved',
          },
        });
      }

      // 3. Se o agente tiver terminal, mudar status para 'delivered'
      if (agent.terminal?.id) {
        await tx.terminal.update({
          where: { id: agent.terminal.id },
          data: { status: 'delivered' }, // Status alterado para 'delivered'
        });
      }
    }
  }

  return { agentIdReference };
};

export function parseCoordinates(coordinates?: string | null) {
  const coords = { latitude: 0, longitude: 0 };
  if (!coordinates) return coords;

  const [lat, lng] = coordinates
    .trim()
    .split(',')
    .map(n => Number(n) || 0);
  coords.latitude = lat;
  coords.longitude = lng;
  return coords;
}
