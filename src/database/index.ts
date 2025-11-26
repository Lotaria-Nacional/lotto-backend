import { seedAreas } from './areas';
import { seedZones } from './zones';
import { resetDatabase } from './reset';
import { PrismaClient } from '@prisma/client';
import { seedAdministrations } from './admins';
import { seedProvinceAndCities } from './provinces-cities';

const prisma = new PrismaClient();

async function seedData() {
  try {
    await prisma.$transaction(async tx => {
      await resetDatabase(tx);
      // await tx.idReference.createMany({
      //   data: [
      //     { type: 'lotaria_nacional', counter: 9000 },
      //     { type: 'revendedor', counter: 1000 },
      //   ],
      // });
      const areas = await seedAreas(tx);
      const zones = await seedZones(tx);
      await seedAdministrations(tx);
      await seedProvinceAndCities(tx, areas, zones);
      // await seedTypesAndSubtypes(tx);
      // await seedUsersAndGroups(tx);

      console.log('✅ Database seeded successfully.');
    });
  } catch (error) {
    console.error('❌ Error while generating seed.', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedData();
