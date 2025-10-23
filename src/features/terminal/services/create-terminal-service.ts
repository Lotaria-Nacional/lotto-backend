import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { BadRequestError } from '../../../errors';
import { AuthPayload } from '../../../@types/auth-payload';
import { CreateTerminalDTO } from '@lotaria-nacional/lotto';

export async function createTerminalService({
  user,
  ...data
}: CreateTerminalDTO & { user: AuthPayload }): Promise<{ id: string }> {
  const response = await prisma.$transaction(async (tx) => {
    const existingTerminal = await tx.terminal.findUnique({
      where: {
        serial: data.serial,
      },
    });

    if (existingTerminal) {
      throw new BadRequestError('Já existe um terminal com esse número de série');
    }

    const terminal = await tx.terminal.create({
      data: {
        note: data.note,
        serial: data.serial,
        device_id: data.device_id,
        arrived_at: data.arrived_at,
        obs: data.obs,
      },
    });

    let description = '';
    if (data.note) {
      description = 'Adicionou uma máquina SUNMI V2 e reportou uma avaria';
    } else {
      description = 'Adicionou uma máquina SUNMI V2 ao inventário';
    }

    await audit(tx, 'CREATE', {
      entity: 'TERMINAL',
      user,
      before: null,
      after: terminal,
      description,
    });

    return terminal;
  });

  return { id: response.id };
}
