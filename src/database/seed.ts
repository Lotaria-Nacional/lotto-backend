import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedData() {
  try {
    await prisma.$transaction(async tx => {
      // Primeiro apaga tabelas que dependem de user e group
      await tx.membership.deleteMany();
      await tx.groupPermission.deleteMany();

      // Agora pode apagar grupos e usuários
      await tx.group.deleteMany();
      await tx.user.deleteMany();

      // Depois apaga o resto
      await tx.city.deleteMany();
      await tx.province.deleteMany();
      await tx.subtype.deleteMany();
      await tx.type.deleteMany();
      await tx.zone.deleteMany();
      await tx.area.deleteMany();
      await tx.administration.deleteMany();
      await tx.agent.deleteMany();
      await tx.terminal.deleteMany();
      await tx.licence.deleteMany();
      await tx.pos.deleteMany();
      await tx.simCard.deleteMany();
      await tx.idReference.deleteMany();

      await tx.province.createMany({
        data: [
          { name: 'Bengo' },
          { name: 'Benguela' },
          { name: 'Bié' },
          { name: 'Cabinda' },
          { name: 'Cuando Cubango' },
          { name: 'Cuanza Norte' },
          { name: 'Cuanza Sul' },
          { name: 'Cunene' },
          { name: 'Huambo' },
          { name: 'Huíla' },
          { name: 'Luanda' },
          { name: 'Lunda Norte' },
          { name: 'Lunda Sul' },
          { name: 'Malanje' },
          { name: 'Moxico' },
          { name: 'Namibe' },
          { name: 'Uíge' },
          { name: 'Zaire' },
        ],
      });

      /**
       * 2.1 Inserir cidades da província de Luanda
       */
      const luanda = await tx.province.findUnique({
        where: { name: 'Luanda' },
      });

      if (luanda) {
        await tx.city.createMany({
          data: [
            { name: 'Belas', province_id: luanda.id },
            { name: 'Cacuaco', province_id: luanda.id },
            { name: 'Cazenga', province_id: luanda.id },
            { name: 'Ícolo e Bengo', province_id: luanda.id },
            { name: 'Luanda (Ingombota)', province_id: luanda.id },
            { name: 'Kilamba Kiaxi', province_id: luanda.id },
            { name: 'Quiçama', province_id: luanda.id },
            { name: 'Talatona', province_id: luanda.id },
            { name: 'Viana', province_id: luanda.id },
          ],
        });
      }

      const [_a, supermercado_id, _p, quiosque_id] = await Promise.all([
        tx.type.create({ data: { name: 'Ambulante' } }),
        tx.type.create({ data: { name: 'Supermercado' } }),
        tx.type.create({ data: { name: 'Popup-kit' } }),
        tx.type.create({ data: { name: 'Quiosque' } }),
        tx.type.create({ data: { name: 'Agências' } }),
        tx.type.create({ data: { name: 'Comércio' } }),
      ]);

      await tx.subtype.createMany({
        data: [
          { name: 'Arreiou', type_id: supermercado_id.id },
          { name: 'Kibabo', type_id: supermercado_id.id },
          { name: 'Nossa casa', type_id: supermercado_id.id },
          { name: 'Angomart', type_id: supermercado_id.id },
          { name: 'Bancada', type_id: quiosque_id.id },
          { name: 'Roulote', type_id: quiosque_id.id },
        ],
      });

      await tx.administration.createMany({
        data: [{ name: 'Viana' }, { name: 'Belas' }, { name: 'Benfica' }, { name: 'Maianga' }, { name: 'Talatona' }],
      });

      await tx.idReference.createMany({
        data: [
          { type: 'lotaria_nacional', counter: 9000 },
          { type: 'revendedor', counter: 1000 },
        ],
      });

      const [a, b, c, d] = await Promise.all([
        tx.area.create({ data: { name: 'A' } }),
        tx.area.create({ data: { name: 'B' } }),
        tx.area.create({ data: { name: 'C' } }),
        tx.area.create({ data: { name: 'D' } }),
      ]);

      await tx.zone.createMany({
        data: [
          { number: 1, area_id: a.id },
          { number: 2, area_id: b.id },
          { number: 3, area_id: c.id },
          { number: 4, area_id: d.id },

          { number: 5, area_id: a.id },
          { number: 6, area_id: b.id },
          { number: 7, area_id: c.id },
          { number: 8, area_id: d.id },

          { number: 9, area_id: a.id },
          { number: 10, area_id: b.id },
          { number: 11, area_id: c.id },
          { number: 12, area_id: d.id },

          { number: 13, area_id: a.id },
          { number: 14, area_id: b.id },
          { number: 15, area_id: c.id },
          { number: 16, area_id: d.id },

          { number: 17, area_id: a.id },
          { number: 18, area_id: b.id },
          { number: 19, area_id: c.id },
          { number: 20, area_id: d.id },
        ],
      });

      const password = await bcrypt.hash('msftsrep0.', 10);

      const { id: userId } = await tx.user.create({
        data: {
          first_name: 'Paulo',
          last_name: 'Luguenda',
          email: 'p.luguenda@lotarianacional.co.ao',
          password,
          role: 'admin', // opcional, se quiser já como admin
        },
      });

      await tx.group.create({
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
              data: [{ module: 'all', action: ['manage'] }],
            },
          },
        },
      });

      await prisma.group.create({
        data: {
          name: 'Pendentes',
          description: 'Usuários recém-criados que ainda não têm grupo definido',
        },
      });

      console.log('Database seeded successfuly.');
    });
  } catch (error) {
    console.error('Error while generate seed.', error);
  } finally {
    prisma.$disconnect();
  }
}

seedData();
