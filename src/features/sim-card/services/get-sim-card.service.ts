import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';

export async function getSimCardService(id: string) {
  const simCard = await prisma.simCard.findUnique({
    where: {
      id,
    },
    include: {
      terminal: {
        select: {
          id: true,
          serial: true,
          device_id: true,
          leaved_at: true,
          status: true,
          agent: {
            select: {
              id: true,
              id_reference: true,
              first_name: true,
              last_name: true,
              agent_type: true,
            },
          },
        },
      },
    },
  });

  if (!simCard) throw new NotFoundError('Sim card não encontrado');

  return simCard;
}
