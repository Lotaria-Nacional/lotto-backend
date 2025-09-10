import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { audit } from '../../../utils/audit-log';
import { AuthPayload } from '@lotaria-nacional/lotto';

export async function activateTerminalService(id: string, user: AuthPayload) {
  await prisma.$transaction(async tx => {
    const terminal = await tx.terminal.findUnique({
      where: { id },
    });

    if (!terminal) throw new NotFoundError('Terminal não encontrado');

    const terminalUpdated = await tx.terminal.update({
      where: { id },
      data: {
        status: 'ready',
      },
    });

    await audit(tx, 'APPROVE', {
      entity: 'TERMINAL',
      user,
      before: terminal,
      after: terminalUpdated,
    });
  });
}
