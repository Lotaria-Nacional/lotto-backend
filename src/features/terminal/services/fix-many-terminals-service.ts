import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { AuthPayload } from '@lotaria-nacional/lotto';

export async function fixManyTerminalsService(ids: string[], user: AuthPayload) {
  await prisma.$transaction(async tx => {
    for (const id of ids) {
      const terminal = await tx.terminal.findUnique({
        where: { id },
      });

      if (!terminal) {
        continue;
      }

      const updated = await tx.terminal.update({
        where: { id },
        data: {
          status: 'fixed',
          note: null,
        },
      });

      await audit(tx, 'FIX', {
        entity: 'TERMINAL',
        user,
        before: terminal,
        after: updated,
        description: `Concertou um terminal`,
      });
    }
  });
}
