// import fs from 'fs';
// import csvParser from 'csv-parser';
// import prisma from '../../../lib/prisma';
// import { AuthPayload } from '@lotaria-nacional/lotto';
// import z from 'zod';

// export const BATCH_SIZE = 500;

// export async function importPosService(filePath: string, user: AuthPayload) {
//   const errors: any[] = [];
//   let imported = 0;

//   const stream = fs.createReadStream(filePath).pipe(csvParser());
//   const batch: any[] = [];

//   for await (const row of stream) {
//     try {
//       const pos = importPosSchema.parse({
//         agent_id_reference: row['ID REVENDEDOR'],
//         province_name: row['PROVINCIA'],
//         admin_name: row['ADMINISTRACAO'],
//         city_name: row['CIDADE'],
//         area_name: row['AREA'],
//         zone_number: row['ZONA'],
//         status: row['ESTADO'],
//         type_name: row['TIPOLOGIA'],
//         licence_reference: row['LICENCA'],
//         coordinates: row['coordenadas'],
//       });

//       batch.push(pos);

//       console.log(pos);

//       if (batch.length >= BATCH_SIZE) {
//         imported += await processBatch(batch);
//         batch.length = 0; // limpa o batch
//       }
//     } catch (err: any) {
//       errors.push({ row, error: err.message || err });
//     }
//   }

//   if (batch.length > 0) {
//     imported += await processBatch(batch);
//     batch.length = 0;
//   }

//   return { imported, errors };
// }

// // --- Helpers ---

// async function processBatch(batch: any[]) {
//   // Coletar FKs válidas
//   const agentIds = batch.map((b) => b.agent_id_reference).filter(Boolean);
//   const licenceRefs = batch.map((b) => b.licence_reference).filter(Boolean);
//   const areaNames = batch.map((b) => b.area_name).filter(Boolean);
//   const zoneNumbers = batch.map((b) => b.zone_number).filter(Boolean);
//   const cityNames = batch.map((b) => b.city_name).filter(Boolean);
//   const typeNames = batch.map((b) => b.type_name).filter(Boolean);

//   const [agents, licences, areas, zones, cities, types, subtypes] = await Promise.all([
//     prisma.agent.findMany({ where: { id_reference: { in: agentIds } }, select: { id_reference: true } }),
//     prisma.licence.findMany({ where: { reference: { in: licenceRefs } }, select: { reference: true } }),
//     prisma.area.findMany({ where: { name: { in: areaNames } }, select: { name: true } }),
//     prisma.zone.findMany({ where: { number: { in: zoneNumbers } }, select: { number: true } }),
//     prisma.city.findMany({ where: { name: { in: cityNames } }, select: { name: true } }),
//     prisma.type.findMany({ where: { name: { in: typeNames } }, select: { name: true } }),
//     prisma.subtype.findMany({ where: { name: { in: typeNames } }, include: { type: { select: { name: true } } } }),
//   ]);

//   const agentSet = new Set(agents.map((a) => a.id_reference));
//   const licenceSet = new Set(licences.map((l) => l.reference));
//   const areaSet = new Set(areas.map((a) => a.name));
//   const zoneSet = new Set(zones.map((z) => z.number));
//   const citySet = new Set(cities.map((c) => c.name));
//   const typeSet = new Set(types.map((t) => t.name));
//   const subtypeMap = new Map(subtypes.map((s) => [s.name, s]));

//   // Ajustar batch removendo FKs inválidas
//   const cleaned = batch.map((b) => ({
//     ...b,
//     agent_id_reference: b.agent_id_reference && agentSet.has(b.agent_id_reference) ? b.agent_id_reference : null,
//     licence_reference: b.licence_reference && licenceSet.has(b.licence_reference) ? b.licence_reference : null,
//     area_name: b.area_name && areaSet.has(b.area_name) ? b.area_name : null,
//     zone_number: b.zone_number && zoneSet.has(b.zone_number) ? b.zone_number : null,
//     city_name: b.city_name && citySet.has(b.city_name) ? b.city_name : null,
//     type_name: b.type_name
//       ? subtypeMap.has(b.type_name)
//         ? subtypeMap.get(b.type_name)!.type.name
//         : typeSet.has(b.type_name)
//         ? b.type_name
//         : null
//       : null,
//     subtype_name: b.type_name && subtypeMap.has(b.type_name) ? subtypeMap.get(b.type_name)!.name : null,
//   }));

//   try {
//     const res = await prisma.pos.createMany({ data: cleaned, skipDuplicates: true });
//     return res.count;
//   } catch (err: any) {
//     console.error('Erro ao importar batch POS:', err);
//     return 0;
//   }
// }

// // --- Transform helpers ---
// function parseNumber(val: string | undefined) {
//   if (!val) return null;
//   const cleaned = val.replace(/\D/g, '');
//   return cleaned ? Number(cleaned) : null;
// }

// function cleanArea(val: string) {
//   return (
//     val
//       .replace(/^area\s*/i, '')
//       .trim()
//       .toUpperCase() || null
//   );
// }

// function cleanZone(val: string) {
//   const num = val.replace(/^zona\s*/i, '').trim();
//   const parsed = Number(num);
//   return isNaN(parsed) ? null : parsed;
// }

// function parseStatus(val: string | undefined) {
//   if (!val) return 'pending';
//   switch (val.trim().toLowerCase()) {
//     case 'activo':
//     case 'active':
//       return 'active';
//     case 'negado':
//     case 'denied':
//       return 'denied';
//     case 'pendente':
//     case 'pending':
//       return 'pending';
//     case 'por verificar':
//     case 'to verify':
//       return 'pending';
//     default:
//       return 'pending';
//   }
// }

// export const importPosSchema = z.object({
//   agent_id_reference: z
//     .string()
//     .optional()
//     .transform((val) => {
//       if (!val) return null;
//       const cleaned = val.replace(/\D/g, '');
//       return cleaned ? Number(cleaned) : null;
//     }),
//   province_name: z
//     .string()
//     .optional()
//     .transform((val) => val?.trim().toLowerCase() || null),
//   admin_name: z
//     .string()
//     .optional()
//     .transform((val) => val?.trim().toLowerCase() || null),
//   city_name: z
//     .string()
//     .optional()
//     .transform((val) => {
//       if (!val) return null;
//       const cleaned = val.trim().toLowerCase();
//       return ['n/d', 'agencias'].includes(cleaned) ? null : cleaned;
//     }),
//   area_name: z
//     .string()
//     .optional()
//     .transform((val) => {
//       if (!val) return null;
//       const cleaned = val
//         .replace(/^area\s*/i, '')
//         .trim()
//         .toUpperCase();
//       return cleaned || null;
//     }),
//   zone_number: z
//     .string()
//     .optional()
//     .transform((val) => {
//       if (!val) return null;
//       const num = val.replace(/^zona\s*/i, '').trim();
//       const parsed = Number(num);
//       return isNaN(parsed) ? null : parsed;
//     }),
//   status: z
//     .string()
//     .optional()
//     .transform((val) => {
//       if (!val) return 'pending';
//       switch (val.trim().toLowerCase()) {
//         case 'activo':
//         case 'active':
//           return 'active';
//         case 'negado':
//         case 'denied':
//           return 'denied';
//         case 'pendente':
//         case 'pending':
//         case 'por verificar':
//           return 'pending';
//         default:
//           return 'pending';
//       }
//     }),
//   type_name: z
//     .string()
//     .optional()
//     .transform((val) => {
//       if (!val) return null;
//       const regex = /^agencia\s*(.*)$/i;
//       const match = val.match(regex);
//       if (match && match[1].trim() !== '') return match[1].trim().toLowerCase();
//       const cleaned = val.trim().toLowerCase();
//       return cleaned === 'agencia' || cleaned === '' ? null : cleaned;
//     }),
//   subtype_name: z.string().optional().nullable().default(null),
//   licence_reference: z
//     .string()
//     .optional()
//     .transform((val) => val?.trim() || null),
//   coordinates: z
//     .string()
//     .optional()
//     .transform((val) => val?.trim() || null),
// });
