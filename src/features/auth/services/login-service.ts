import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthPayload } from '../../../@types/auth-payload';
import { BadRequestError } from '../../../errors';
import prisma from '../../../lib/prisma';
import { loginDTO } from '../schemas/login.schema';
import env from '../../../constants/env';
import { audit } from '../../../utils/audit-log';

export async function loginService(data: loginDTO) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!existingUser) throw new BadRequestError('Credenciais inválidas.');

  const isSamePassword = await bcrypt.compare(data.password, existingUser.password);

  if (!isSamePassword) throw new BadRequestError('Credenciais inválidas.');

  const user: AuthPayload = {
    name: `${existingUser.first_name} ${existingUser.last_name}`,
    id: existingUser.id,
    email: existingUser.email,
  };

  const accessToken = jwt.sign(user, env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(user, env.JWT_REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

  const userMapper = {
    Nome: existingUser.first_name,
    Sobrenome: existingUser.last_name,
    Email: existingUser.email,
  };

  await prisma.$transaction(async (tx) => {
    await audit(tx, 'CREATE', {
      entity: 'USER',
      user,
      before: null,
      after: userMapper,
      description: `${existingUser.first_name} ${existingUser.last_name} entrou no sistema`,
    });
  });

  return { accessToken, refreshToken };
}
