import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { AuthPayload } from '../../../@types/auth-payload';
import { CreateTerminalDTO } from '@lotaria-nacional/lotto';

export async function createTerminalService({
  user,
  ...data
}: CreateTerminalDTO & { user: AuthPayload }): Promise<{ id: string }> {
  const response = await prisma.$transaction(async (tx) => {
    const terminal = await tx.terminal.create({
      data: {
        note: data.note,
        serial: data.serial,
        device_id: data.device_id,
        arrived_at: data.arrived_at,
      },
    });

    await audit(tx, 'CREATE', {
      entity: 'TERMINAL',
      user,
      before: null,
      after: terminal,
    });

    return terminal;
  });

  return { id: response.id };
}
