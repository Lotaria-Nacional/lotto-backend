import { Response } from 'express';
import prisma from '../../../lib/prisma';
import { Terminal } from '@prisma/client';
import { TerminalStatus } from '@lotaria-nacional/lotto';

const terminalStatus: Record<TerminalStatus, string> = {
  ready: 'Pronto',
  broken: 'Avariado',
  stock: 'Inventario',
  fixed: 'Concertado',
  on_field: 'Em campo',
  discontinued: 'Negado',
  training: 'Em formacao',
  maintenance: 'Em manuntencao',
};

export async function exportTerminalService(res: Response) {
  res.write('ID REVENDEDOR, Nº DE SERIE, DEVICE ID, ESTADO, DATA DE ENTRADA, DATA DE SAIDA\n');

  let cursor: string | null = null;
  const batchSize = 500;

  while (true) {
    const batch: Terminal[] = await prisma.terminal.findMany({
      take: batchSize,
      skip: cursor ? 1 : 0,
      ...(cursor ? { cursor: { id: cursor } } : {}),
      orderBy: { id: 'desc' },
      include: {
        sim_card: true,
      },
    });

    if (batch.length === 0) break;

    for (const terminal of batch) {
      const line = [
        terminal.agent_id_reference,
        terminal.serial,
        terminal.device_id,
        terminalStatus[terminal?.status ?? 'stock'],
        terminal?.arrived_at?.toISOString().split('T')[0] ?? '',
        terminal.leaved_at?.toISOString().split('T')[0] ?? '',
      ]
        .map((v) => `"${v ?? ''}"`)
        .join(',');

      res.write(line + '\n');
    }

    cursor = batch[batch.length - 1].id;
  }

  res.end();
}
