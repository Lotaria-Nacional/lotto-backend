import { Terminal } from '@prisma/client';
import prisma from '../../../lib/prisma';
import { Response } from 'express';

export async function exportTerminalService(res: Response) {
  res.write('id,serial,device_id,note,status,created_at,arrived_at,leaved_at,agent_id_reference\n');

  let cursor: string | null = null;
  const batchSize = 500;

  while (true) {
    const batch: Terminal[] = await prisma.terminal.findMany({
      take: batchSize,
      skip: cursor ? 1 : 0,
      ...(cursor ? { cursor: { id: cursor } } : {}),
      orderBy: { id: 'desc' },
    });

    if (batch.length === 0) break;

    for (const terminal of batch) {
      const line = [
        terminal.id,
        terminal.serial,
        terminal.device_id,
        terminal.note,
        terminal.status,
        terminal.created_at.toISOString(),
        terminal.arrived_at.toISOString(),
        terminal.leaved_at?.toISOString() ?? '',
        terminal.agent_id_reference,
      ]
        .map((v) => `"${v ?? ''}"`)
        .join(',');

      res.write(line + '\n');
    }

    cursor = batch[batch.length - 1].id;
  }

  res.end();
}
