import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';

export async function markTerminalAsFixedService(id: string) {
  await prisma.$transaction(async tx => {
    const terminal = await tx.terminal.findUnique({
      where: { id },
    });

    if (!terminal) throw new NotFoundError('Terminal não encontrado');

    await tx.terminal.update({
      where: { id },
      data: {
        status: 'stock',
        note: null,
      },
    });
  });
}
