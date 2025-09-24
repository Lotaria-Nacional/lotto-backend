import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { audit } from '../../../utils/audit-log';
import { AuthPayload } from '../../../@types/auth-payload';

export async function deletePosService(id: string, user: AuthPayload) {
  await prisma.$transaction(async (tx) => {
    const pos = await tx.pos.findUnique({ where: { id } });

    if (!pos) throw new NotFoundError(`O POS não foi encontrado.`);

    await tx.pos.delete({ where: { id } });

    await audit(tx, 'DELETE', {
      user,
      entity: 'POS',
      before: pos,
      after: null,
      description: 'Removeu um ponto de venda',
    });
  });
}
