import prisma from '../../../lib/prisma';

export async function updateIdReference() {
  try {
    await prisma.$transaction(async tx => {
      const lastLotaria = await tx.agent.findFirst({
        where: { agent_type: 'lotaria_nacional' },
        orderBy: { id_reference: 'desc' },
        select: { id_reference: true },
      });

      const lastRevendedor = await tx.agent.findFirst({
        where: { agent_type: 'revendedor' },
        orderBy: { id_reference: 'desc' },
        select: { id_reference: true },
      });

      if (lastRevendedor?.id_reference) {
        await tx.idReference.upsert({
          where: { type: 'revendedor' },
          update: { counter: lastRevendedor.id_reference },
          create: { type: 'revendedor', counter: lastRevendedor.id_reference },
        });
      }

      if (lastLotaria?.id_reference) {
        await tx.idReference.upsert({
          where: { type: 'lotaria_nacional' },
          update: { counter: lastLotaria.id_reference },
          create: { type: 'lotaria_nacional', counter: lastLotaria.id_reference },
        });
      }
    });

    console.log('✅ idReference atualizado com sucesso.');
  } catch (error) {
    console.error('❌ Erro ao atualizar idReference:', error);
  }
}
