import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error', 'info'],
});

const checkConnection = async () => {
  try {
    await prisma.$connect();
    console.info('Prisma Connected succesfully`');
  } catch (error) {
    console.error('Error While Connecting Prisma');
  }
};

checkConnection();

export default prisma;
