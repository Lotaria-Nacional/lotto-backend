import app from '../src';
import bcrypt from 'bcrypt';
import request from 'supertest';
import prisma from '../src/lib/prisma';
import { randomUUID } from 'node:crypto';
import { execSync } from 'node:child_process';
import { CreateUserDTO } from '../src/features/user/schemas/create-user.schema';

export let token: string;
export let userId: string;
export let adminId: number;
export let provinceId: number;
export let cityId: number;

const password = 'msftsrep0.';

beforeAll(async () => {
  execSync('yarn prisma migrate deploy', { stdio: 'inherit' });
});

beforeEach(async () => {
  await cleanDatabase();

  const { user } = await seedData();

  const loginRes = await request(app).post('/api/auth/login').send({
    email: user.email,
    password: password,
  });

  token = loginRes.body.accessToken;
});

afterAll(async () => await prisma.$disconnect());

async function seedData() {
  const { user } = await createUserSeed();
  await createAdminSeed();
  await createProvinceAndCitySeed();
  await createIdReferenceSeed();

  return { user };
}

async function cleanDatabase() {
  await prisma.membership.deleteMany();
  await prisma.groupPermission.deleteMany();
  await prisma.group.deleteMany();
  await prisma.pos.deleteMany();
  await prisma.city.deleteMany();
  await prisma.province.deleteMany();
  await prisma.administration.deleteMany();
  await prisma.idReference.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.simCard.deleteMany();
  await prisma.terminal.deleteMany();
  await prisma.licence.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.area.deleteMany();
  await prisma.zone.deleteMany();
  await prisma.type.deleteMany();
  await prisma.subtype.deleteMany();
  await prisma.user.deleteMany();
}

async function createUserSeed() {
  const email = `p.luguenda-${randomUUID()}@lotarianacional.co.ao`;
  const hashed = await bcrypt.hash(password, 10);

  const data: Omit<CreateUserDTO, 'user' | 'reset_password_token'> = {
    first_name: 'Paulo',
    last_name: 'Luguenda',
    email,
    password: hashed,
  };

  const user = await prisma.user.create({ data });
  userId = user.id;

  return { user };
}

async function createIdReferenceSeed() {
  const { count } = await prisma.idReference.createMany({
    data: [
      {
        counter: 1000,
        type: 'revendedor',
      },
      {
        counter: 9000,
        type: 'lotaria_nacional',
      },
    ],
  });

  return { idReference: count };
}

async function createProvinceAndCitySeed() {
  const province = await prisma.province.create({
    data: {
      name: 'Luanda',
      cities: {
        create: {
          name: 'Luanda',
        },
      },
    },
    include: { cities: { select: { id: true } } },
  });

  cityId = province.cities[0].id;
  provinceId = province.id;
}

async function createAdminSeed() {
  const admin = await prisma.administration.create({
    data: {
      name: 'maianga',
    },
  });

  adminId = admin.id;
}
