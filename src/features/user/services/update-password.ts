import bcrypt from 'bcrypt';
import prisma from '../../../lib/prisma';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { UpdateUserPasswordDTO } from '../controllers/update-password-controller';

export async function updateUserPasswordService(data: UpdateUserPasswordDTO, user: AuthPayload) {
  // 1. Buscar user no DB
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, password: true },
  });

  if (!dbUser) {
    throw new Error('Utilizador não encontrado');
  }

  // 2. Validar oldPassword
  const isValid = await bcrypt.compare(data.oldPassword, dbUser.password);
  if (!isValid) {
    throw new Error('Password antiga inválida');
  }

  // 3. Gerar hash da nova password
  const newHash = await bcrypt.hash(data.newPassword, 10);

  // 4. Actualizar no DB
  await prisma.$transaction(async tx => {
    await tx.user.update({
      where: { id: dbUser.id },
      data: { password: newHash },
    });
  });
}
