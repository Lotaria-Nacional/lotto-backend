import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['info', 'warn', 'error'],
});

const checkConnection = async () => {
  try {
    await prisma.$connect();
    console.info('Prisma connected successfully!');
  } catch (error) {
    console.error('Error connecting Prisma:', error);
  }
};

checkConnection();

export default prisma;
