import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { AuthPayload } from '@lotaria-nacional/lotto';

export async function approveManyPosService(ids: string[], user: AuthPayload) {
  await prisma.$transaction(async tx => {
    for (const id of ids) {
      const pos = await tx.pos.findUnique({ where: { id } });

      if (!pos) {
        continue; // ignora se não encontrar
      }

      const updated = await tx.pos.update({
        where: { id },
        data: { status: 'approved' },
      });

      await audit(tx, 'APPROVE', {
        user,
        entity: 'POS',
        before: pos,
        after: updated,
        description: `Aprovou um ponto de venda`,
      });
    }
  });
}
