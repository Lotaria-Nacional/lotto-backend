import bcrypt from 'bcrypt';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function seedData() {
  try {
    await prisma.$transaction(async (tx) => {
      /* RESET DATABASE */
      await resetDatabase(tx);

      // Referências iniciais
      await tx.idReference.createMany({
        data: [
          { type: 'lotaria_nacional', counter: 9000 },
          { type: 'revendedor', counter: 1000 },
        ],
      });

      // Áreas e zonas
      const areas = await seedAreas(tx);
      const zones = await seedZones(tx);

      // Administrações
      const administrations = await seedAdministrations(tx);

      // Províncias e cidades
      await seedProvinceAndCities(tx, areas, zones, administrations);

      // Tipos e subtipos
      await seedTypesAndSubtypes(tx);

      // Usuários e grupos
      await seedUsersAndGroups(tx);

      console.log('Database seeded successfully.');
    });
  } catch (error) {
    console.error('Error while generating seed.', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedData();

/* ================= RESET DATABASE ================= */
async function resetDatabase(tx: Prisma.TransactionClient) {
  await tx.activity.deleteMany();
  await tx.agentActivity.deleteMany();

  await tx.membership.deleteMany();
  await tx.groupPermission.deleteMany();
  await tx.idReference.deleteMany();

  await tx.simCard.deleteMany();
  await tx.licence.deleteMany();
  await tx.terminal.deleteMany();
  await tx.agent.deleteMany();
  await tx.pos.deleteMany();

  await tx.city.deleteMany();
  await tx.province.deleteMany();
  await tx.subtype.deleteMany();
  await tx.type.deleteMany();
  await tx.zone.deleteMany();
  await tx.area.deleteMany();
  await tx.administration.deleteMany();

  await tx.group.deleteMany();
  await tx.user.deleteMany();
}

/* ================= SEED AREAS ================= */
async function seedAreas(tx: Prisma.TransactionClient) {
  const areasData = ['A', 'B', 'C', 'D', 'E', 'F'];

  const areas = await Promise.all(areasData.map((name) => tx.area.create({ data: { name } })));

  return areas;
}

/* ================= SEED ZONES ================= */
async function seedZones(tx: Prisma.TransactionClient) {
  const zoneNumbers = Array.from({ length: 24 }, (_, i) => i + 1);

  const zones = await Promise.all(zoneNumbers.map((number) => tx.zone.create({ data: { number } })));

  return zones;
}

/* ================= SEED ADMINISTRATIONS ================= */
async function seedAdministrations(tx: Prisma.TransactionClient) {
  const adminNames = ['Kilamba Kiaxi', 'Ingombota', 'Samba', 'Talatona', 'Viana', 'Cacuaco', 'Cazenga', 'Sambizanga'];

  const administrations = await Promise.all(adminNames.map((name) => tx.administration.create({ data: { name } })));

  return administrations;
}

/* ================= SEED PROVINCE AND CITIES ================= */
async function seedProvinceAndCities(tx: Prisma.TransactionClient, areas: any[], zones: any[], administrations: any[]) {
  const { id: luandaId } = await tx.province.create({ data: { name: 'Luanda' } });

  const citiesData = [
    { name: 'Ingombota', area: areas[0], zone: zones[0], adminName: 'Ingombota' },
    { name: 'Mutamba', area: areas[0], zone: zones[1], adminName: 'Ingombota' },
    { name: 'Samba', area: areas[0], zone: zones[2], adminName: 'Samba' },
    { name: 'Morro bento', area: areas[0], zone: zones[3], adminName: 'Talatona' },
    { name: 'Nova vida', area: areas[1], zone: zones[4], adminName: 'Kilamba Kiaxi' },
    { name: 'Talatona', area: areas[1], zone: zones[5], adminName: 'Talatona' },
    { name: 'Patriota', area: areas[1], zone: zones[6], adminName: 'Talatona' },
    { name: 'Benfica', area: areas[1], zone: zones[7], adminName: 'Talatona' },
    { name: 'Fubu', area: areas[2], zone: zones[8], adminName: 'Talatona' },
    { name: 'Calemba 2', area: areas[2], zone: zones[9], adminName: 'Talatona' },
    { name: 'Camama', area: areas[2], zone: zones[10], adminName: 'Talatona' },
    { name: 'Viana', area: areas[2], zone: zones[11], adminName: 'Viana' },
    { name: 'Palanca', area: areas[3], zone: zones[12], adminName: 'Kilamba Kiaxi' },
    { name: 'Mulenvos', area: areas[3], zone: zones[13], adminName: 'Cacuaco' },
    { name: 'Cazenga', area: areas[3], zone: zones[14], adminName: 'Cazenga' },
    { name: 'São Paulo', area: areas[3], zone: zones[15], adminName: 'Sambizanga' },
    { name: 'Kikolo', area: areas[4], zone: zones[16], adminName: 'Cacuaco' },
    { name: 'Sambizanga', area: areas[4], zone: zones[17], adminName: 'Sambizanga' },
    { name: 'Cacuaco', area: areas[4], zone: zones[18], adminName: 'Cacuaco' },
    { name: 'Quifangondo', area: areas[4], zone: zones[19], adminName: 'Cacuaco' },
    { name: 'Belo monte', area: areas[5], zone: zones[20], adminName: 'Cacuaco' },
    { name: 'Capalanga', area: areas[5], zone: zones[21], adminName: 'Viana' },
    { name: 'Luanda sul', area: areas[5], zone: zones[22], adminName: 'Viana' },
    { name: 'Zango', area: areas[5], zone: zones[23], adminName: 'Viana' },
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

/* ================= SEED TYPES AND SUBTYPES ================= */
async function seedTypesAndSubtypes(tx: Prisma.TransactionClient) {
  await tx.type.createMany({
    data: [{ name: 'Ambulante' }, { name: 'Popup-kit' }, { name: 'Agências' }, { name: 'Comércio' }],
  });

  await tx.type.create({
    data: {
      name: 'Supermercado',
      subtypes: {
        createMany: {
          data: [{ name: 'Arreiou' }, { name: 'Kibabo' }, { name: 'Nossa casa' }, { name: 'Angomart' }],
        },
      },
    },
  });

  await tx.type.create({
    data: {
      name: 'Quiosque',
      subtypes: {
        createMany: {
          data: [{ name: 'Bancada' }, { name: 'Roulote' }],
        },
      },
    },
  });
}

/* ================= SEED USERS AND GROUPS ================= */
async function seedUsersAndGroups(tx: Prisma.TransactionClient) {
  const pauloPassword = await bcrypt.hash('msftsrep0.', 10);
  const divaldoPassword = await bcrypt.hash('Lp6#YtX4$Nq10', 10);
  const sebastiaoPassword = await bcrypt.hash('MenteCriativa@1', 10);

  const { id: pauloId } = await tx.user.create({
    data: {
      first_name: 'Paulo',
      last_name: 'Luguenda',
      email: 'p.luguenda@lotarianacional.co.ao',
      password: pauloPassword,
      role: 'admin',
    },
  });

  const { id: sebastiaoId } = await tx.user.create({
    data: {
      first_name: 'Sebastião',
      last_name: 'Simão',
      email: 's.simao@lotarianacional.co.ao',
      password: sebastiaoPassword,
      role: 'admin',
    },
  });

  const { id: divaldoId } = await tx.user.create({
    data: {
      first_name: 'Divaldo',
      last_name: 'Cristóvão',
      email: 'divaldoc@lotarianacional.co.ao',
      password: divaldoPassword,
      role: 'admin',
    },
  });

  await tx.group.create({
    data: {
      name: 'Admin',
      description: 'This is a test group',
      memberships: { createMany: { data: [{ user_id: pauloId }, { user_id: sebastiaoId }, { user_id: divaldoId }] } },
      permissions: { createMany: { data: [{ module: 'all', action: ['manage'] }] } },
    },
  });

  await tx.group.create({
    data: { name: 'Pendentes', description: 'Usuários recém-criados que ainda não têm grupo definido' },
  });
}
