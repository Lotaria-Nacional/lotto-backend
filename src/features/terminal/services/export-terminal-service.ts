import { Response } from 'express';
import prisma from '../../../lib/prisma';
import { Terminal } from '@prisma/client';
import { TerminalStatus } from '@lotaria-nacional/lotto';
import { PaginationParams } from '../../../@types/pagination-params';
import { buildTermninalWhereInput } from '../utils/filters';

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

export async function exportTerminalService(res: Response, filters: PaginationParams) {
  const where = buildTermninalWhereInput(filters);

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
      where,
    });

    if (batch.length === 0) break;

    for (const terminal of batch) {
      const line = [
        terminal.agent_id_reference,
        terminal.serial,
        terminal.device_id,
        terminal.status,
        terminal?.arrived_at?.toISOString().split('T')[0] ?? '',
        terminal.leaved_at?.toISOString().split('T')[0] ?? '',
      ]
        .map(v => `"${v ?? ''}"`)
        .join(',');

      res.write(line + '\n');
    }

    cursor = batch[batch.length - 1].id;
  }

  res.end();
}
