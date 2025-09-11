import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedData() {
  try {
    await prisma.city.deleteMany();
    await prisma.province.deleteMany();
    await prisma.subtype.deleteMany();
    await prisma.type.deleteMany();
    await prisma.zone.deleteMany();
    await prisma.area.deleteMany();
    await prisma.administration.deleteMany();
    await prisma.agent.deleteMany();
    await prisma.terminal.deleteMany();
    await prisma.licence.deleteMany();
    await prisma.pos.deleteMany();
    await prisma.simCard.deleteMany();
    await prisma.idReference.deleteMany();
    await prisma.user.deleteMany();
    await prisma.group.deleteMany();
    await prisma.groupPermission.deleteMany();
    await prisma.membership.deleteMany();

    await prisma.province.create({
      data: {
        name: 'Luanda',
        cities: {
          createMany: {
            data: [
              { name: 'Luanda' },
              { name: 'Belas' },
              { name: 'Talatona' },
              { name: 'Ingombota' },
              { name: 'Viana' },
            ],
          },
        },
      },
    });

    const [type01, type02, type03] = await Promise.all([
      prisma.type.create({ data: { name: 'Comércio' } }),
      prisma.type.create({ data: { name: 'Popupkit' } }),
      prisma.type.create({ data: { name: 'Supermercado' } }),
    ]);

    await prisma.subtype.createMany({
      data: [
        { name: 'Arreiou', type_id: type01.id },
        { name: 'Kibabo', type_id: type02.id },
        { name: 'Roulote', type_id: type03.id },
      ],
    });

    await prisma.administration.createMany({
      data: [
        { name: 'Admin Viana' },
        { name: 'Admin Belas' },
        { name: 'Admin Benfica' },
        { name: 'Admin Maianga' },
        { name: 'Admin Talatona' },
      ],
    });

    await prisma.idReference.createMany({
      data: [
        { type: 'lotaria_nacional', counter: 9000 },
        { type: 'revendedor', counter: 1000 },
      ],
    });

    const [area01, area02, area03] = await Promise.all([
      prisma.area.create({ data: { name: 'A' } }),
      prisma.area.create({ data: { name: 'B' } }),
      prisma.area.create({ data: { name: 'C' } }),
    ]);

    await prisma.zone.createMany({
      data: [
        { number: 1, area_id: area01.id },
        { number: 2, area_id: area02.id },
        { number: 3, area_id: area03.id },
      ],
    });

    const password = await bcrypt.hash('msftsrep0.', 10);

    const { id: userId } = await prisma.user.create({
      data: {
        first_name: 'Paulo',
        last_name: 'Luguenda',
        email: 'p.luguenda@lotarianacional.co.ao',
        password,
        role: 'admin', // opcional, se quiser já como admin
      },
    });

    await prisma.group.create({
      data: {
        name: 'Dev',
        description: 'This is group test',
        memberships: {
          create: {
            user_id: userId,
          },
        },
        permissions: {
          createMany: {
            data: [{ module: 'AGENT', action: ['CREATE', 'READ', 'UPDATE'] }],
          },
        },
      },
    });

    console.log('Database seeded successfuly.');
  } catch (error) {
    console.error('Error while generate seed.');
  } finally {
    prisma.$disconnect();
  }
}

seedData();

const makeProvinces = () => {};
