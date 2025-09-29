import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { AuthPayload } from '@lotaria-nacional/lotto';

export async function denyManyPosService(ids: string[], user: AuthPayload) {
  await prisma.$transaction(async tx => {
    for (const id of ids) {
      const pos = await tx.pos.findUnique({ where: { id } });

      if (!pos) {
        continue; // ignora se não encontrar
      }

      const updated = await tx.pos.update({
        where: { id },
        data: { status: 'denied' },
      });

      await audit(tx, 'DENY', {
        user,
        entity: 'POS',
        before: pos,
        after: updated,
        description: `Negou um ponto de venda`,
      });
    }
  });
}
