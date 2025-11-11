import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { audit } from '../../../utils/audit-log';
import { AuthPayload, UpdateTerminalDTO } from '@lotaria-nacional/lotto';

export async function reportTerminalMalFunctionService(data: UpdateTerminalDTO, user: AuthPayload) {
  await prisma.$transaction(async tx => {
    const terminal = await tx.terminal.findUnique({
      where: { id: data.id },
    });

    if (!terminal) {
      throw new NotFoundError('Terminal não encontrado');
    }

    // Atualizar terminal
    const terminalUpdated = await tx.terminal.update({
      where: { id: data.id },
      data: {
        note: data.note,
        status: 'broken',
        agent_id_reference: null,
      },
    });

    // Audit log
    await audit(tx, 'UPDATE', {
      user,
      before: terminal,
      entity: 'TERMINAL',
      after: terminalUpdated,
      description: 'Reportou uma avaria no terminal',
    });
  });
}
