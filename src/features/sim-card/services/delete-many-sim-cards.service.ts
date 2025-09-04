import { BadRequestError } from '../../../errors';
import prisma from '../../../lib/prisma';

export async function deleteManySimCardsService(ids: string[]) {
  await prisma.$transaction(async (tx) => {
    const { count } = await tx.simCard.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    if (count === 0) {
      throw new BadRequestError('Nenhum sim card encontrado');
    }
  });

  //TODO: delete sim card and terminal cache
}
