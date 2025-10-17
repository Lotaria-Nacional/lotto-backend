import { seedAreas } from './areas';
import { seedZones } from './zones';
import { resetDatabase } from './reset';
import { PrismaClient } from '@prisma/client';
import { seedAdministrations } from './admins';
import { seedTypesAndSubtypes } from './types-subtypes';
import { seedProvinceAndCities } from './provinces-cities';
import { seedUsersAndGroups } from './user-groups';

const prisma = new PrismaClient();

async function seedData() {
  try {
    await prisma.$transaction(async tx => {
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

      console.log('✅ Database seeded successfully.');
    });
  } catch (error) {
    console.error('❌ Error while generating seed.', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedData();
