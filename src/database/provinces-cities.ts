import { Prisma } from '@prisma/client';

export async function seedProvinceAndCities(
  tx: Prisma.TransactionClient,
  areas: any[],
  zones: any[],
  administrations: any[]
) {
  const { id: luandaId } = await tx.province.create({ data: { name: 'luanda' } });

  const citiesData = [
    { name: 'ingombota', area: areas[0], zone: zones[0], adminName: 'ingombota' },
    { name: 'mutamba', area: areas[0], zone: zones[1], adminName: 'ingombota' },
    { name: 'samba', area: areas[0], zone: zones[2], adminName: 'samba' },
    { name: 'morro bento', area: areas[0], zone: zones[3], adminName: 'talatona' },
    { name: 'nova vida', area: areas[1], zone: zones[4], adminName: 'kilamba kiaxi' },
    { name: 'talatona', area: areas[1], zone: zones[5], adminName: 'talatona' },
    { name: 'patriota', area: areas[1], zone: zones[6], adminName: 'talatona' },
    { name: 'benfica', area: areas[1], zone: zones[7], adminName: 'talatona' },
    { name: 'fubu', area: areas[2], zone: zones[8], adminName: 'talatona' },
    { name: 'calemba 2', area: areas[2], zone: zones[9], adminName: 'talatona' },
    { name: 'camama', area: areas[2], zone: zones[10], adminName: 'talatona' },
    { name: 'viana', area: areas[2], zone: zones[11], adminName: 'viana' },
    { name: 'palanca', area: areas[3], zone: zones[12], adminName: 'kilamba kiaxi' },
    { name: 'mulenvos', area: areas[3], zone: zones[13], adminName: 'cacuaco' },
    { name: 'cazenga', area: areas[3], zone: zones[14], adminName: 'cazenga' },
    { name: 'são Paulo', area: areas[3], zone: zones[15], adminName: 'sambizanga' },
    { name: 'kikolo', area: areas[4], zone: zones[16], adminName: 'cacuaco' },
    { name: 'sambizanga', area: areas[4], zone: zones[17], adminName: 'sambizanga' },
    { name: 'cacuaco', area: areas[4], zone: zones[18], adminName: 'cacuaco' },
    { name: 'quifangondo', area: areas[4], zone: zones[19], adminName: 'cacuaco' },
    { name: 'belo monte', area: areas[5], zone: zones[20], adminName: 'cacuaco' },
    { name: 'capalanga', area: areas[5], zone: zones[21], adminName: 'viana' },
    { name: 'luanda sul', area: areas[5], zone: zones[22], adminName: 'viana' },
    { name: 'zango', area: areas[5], zone: zones[23], adminName: 'viana' },
  ];

  for (const city of citiesData) {
    const admin = administrations.find((a) => a.name === city.adminName);
    await tx.city.create({
      data: {
        name: city.name,
        province_id: luandaId,
        area_id: city.area.id,
        zone_id: city.zone.id,
        administration_id: admin.id,
      },
    });
  }
}
