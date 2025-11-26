import { Prisma } from '@prisma/client';

type City = {
  name: string;
  area: any;
  zone: any;
  adminName?: string;
};

export async function seedProvinceAndCities(tx: Prisma.TransactionClient, areas: any[], zones: any[]) {
  const luanda = await tx.province.upsert({
    where: { name: 'luanda' },
    update: {},
    create: { name: 'luanda' },
  });

  const citiesData: City[] = [
    { name: 'ingombota', area: areas[0], zone: zones[0] }, // A - 1
    { name: 'mutamba', area: areas[0], zone: zones[1] }, // A - 2
    { name: 'samba', area: areas[0], zone: zones[2] }, // A - 3
    { name: 'palanca', area: areas[0], zone: zones[3] }, // A - 4

    { name: 'morro bento', area: areas[1], zone: zones[4] }, // B - 5
    { name: 'nova vida', area: areas[1], zone: zones[5] }, // B - 6
    { name: 'talatona', area: areas[1], zone: zones[6] }, // B - 7
    { name: 'patriota', area: areas[1], zone: zones[7] }, // B - 8

    { name: 'fubu', area: areas[2], zone: zones[8] }, // C - 9
    { name: 'calemba 2', area: areas[2], zone: zones[9] }, // C - 10
    { name: 'camama', area: areas[2], zone: zones[10] }, // C - 11
    { name: 'viana', area: areas[2], zone: zones[11] }, // C - 12

    { name: 'sao paulo', area: areas[3], zone: zones[12] }, // D - 13
    { name: 'sambizanga', area: areas[3], zone: zones[13] }, // D - 14
    { name: 'cazenga popular', area: areas[3], zone: zones[14] }, // D - 15
    { name: 'cazenga kalawenda', area: areas[3], zone: zones[15] }, // D - 16

    { name: 'kikolo', area: areas[4], zone: zones[16] }, // E - 17
    { name: 'mulenvos de baixo', area: areas[4], zone: zones[17] }, // E - 18
    { name: 'mulenvos de cima', area: areas[4], zone: zones[18] }, // E - 19
    { name: 'capalanca', area: areas[4], zone: zones[19] }, // E - 20

    { name: 'cacuaco', area: areas[5], zone: zones[20] }, // F - 21
    { name: 'quifangondo', area: areas[5], zone: zones[21] }, // F - 22
    { name: 'belo monte', area: areas[5], zone: zones[22] }, // F - 23
    { name: 'sequele', area: areas[5], zone: zones[23] }, // F - 24

    { name: 'km 30-viana', area: areas[6], zone: zones[24] }, // G - 25
    { name: 'luanda sul', area: areas[6], zone: zones[25] }, // G - 26
    { name: 'zango 0-2', area: areas[6], zone: zones[26] }, // G - 27
    { name: 'zango 3-5', area: areas[6], zone: zones[27] }, // G - 28

    { name: 'vila flor - bita', area: areas[7], zone: zones[28] }, // H - 29
    { name: 'kilamba', area: areas[7], zone: zones[29] }, // H - 30
    { name: 'benfica', area: areas[7], zone: zones[30] }, // H - 31
    { name: 'belas', area: areas[7], zone: zones[31] }, // H - 32
  ];

  for (const city of citiesData) {
    await tx.city.upsert({
      where: { name: city.name },
      create: {
        name: city.name,
        area_id: city.area.id,
        zone_id: city.zone.id,
        province_id: luanda.id,
      },
      update: {
        area_id: city.area.id,
        zone_id: city.zone.id,
        province_id: luanda.id,
      },
    });
  }
}
