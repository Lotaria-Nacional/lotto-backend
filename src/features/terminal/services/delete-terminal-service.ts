import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { audit } from '../../../utils/audit-log';
import { AuthPayload } from '../../../@types/auth-payload';

export async function deleteTerminalService(id: string, user: AuthPayload) {
  await prisma.$transaction(async (tx) => {
    const terminal = await tx.terminal.findUnique({ where: { id }, include: { sim_card: { select: { id: true } } } });

    if (!terminal) throw new NotFoundError('Terminal não encontrado.');

    await tx.terminal.delete({ where: { id } });

    let description = '';

    if (terminal.sim_card?.id) {
      description = 'Removeu um terminal';
    } else {
      description = 'Removeu uma máquina SUNMI V2 ao inventário';
    }

    await audit(tx, 'DELETE', {
      entity: 'TERMINAL',
      user,
      before: terminal,
      after: null,
      description,
    });
  });
}
