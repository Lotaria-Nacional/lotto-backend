import { NotFoundError } from '../../../errors';
import prisma from '../../../lib/prisma';

export async function deleteSimCardService(id: string): Promise<{ id: string }> {
  const simCard = await prisma.simCard.findUnique({
    where: {
      id,
    },
  });

  if (!simCard) throw new NotFoundError('Sim card não encontrado');

  await prisma.simCard.delete({
    where: {
      id,
    },
  });

  return { id };
}
