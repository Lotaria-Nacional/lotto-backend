import prisma from '../../../lib/prisma';

export async function updateIdReference() {
  try {
    await prisma.$transaction(async tx => {
      // Último id_reference da lotaria
      const lastLotaria = await tx.agent.findFirst({
        where: { agent_type: 'lotaria_nacional' },
        orderBy: { id_reference: 'desc' },
        select: { id_reference: true },
      });

      // Último id_reference do revendedor
      const lastRevendedor = await tx.agent.findFirst({
        where: { agent_type: 'revendedor' },
        orderBy: { id_reference: 'desc' },
        select: { id_reference: true },
      });

      // Actualizar a tabela idReference
      if (lastRevendedor?.id_reference) {
        await tx.idReference.update({
          where: { type: 'revendedor' },
          data: {
            counter: lastRevendedor.id_reference,
          },
        });
      }

      if (lastLotaria?.id_reference) {
        await tx.idReference.update({
          where: { type: 'lotaria_nacional' },
          data: {
            counter: lastLotaria.id_reference,
          },
        });
      }
    });
  } catch (error) {
    console.error(error);
  }
}
