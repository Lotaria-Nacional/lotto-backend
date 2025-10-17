// import env from '../constants/env';
import { PrismaClient } from '@prisma/client';
import env from '../constants/env';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.NODE_ENV === 'development' ? env.DEV_DATABASE_URL : env.DATABASE_URL,
    },
  },
  log: ['info', 'warn', 'error'],
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
