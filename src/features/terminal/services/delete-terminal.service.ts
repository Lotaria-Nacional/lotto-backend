import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { audit } from '../../../utils/audit-log';
import { AuthPayload } from '../../../@types/auth-payload';

export async function deleteTerminalService(id: string, user: AuthPayload) {
  await prisma.$transaction(async tx => {
    const terminal = await tx.terminal.findUnique({ where: { id } });

    if (!terminal) throw new NotFoundError('Terminal não encontrado.');

    await tx.terminal.delete({ where: { id } });

    await audit(tx, 'DELETE', {
      entity: 'TERMINAL',
      user,
      before: terminal,
      after: null,
    });
  });
}
