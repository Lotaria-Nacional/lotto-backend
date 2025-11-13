import { Response } from 'express';
import prisma from '../../../lib/prisma';
import { PaginationParams } from '../../../@types/pagination-params';
import { buildTermninalWhereInput } from '../utils/filters';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { TerminalStatus } from '@lotaria-nacional/lotto';

type TerminalWithRelations = Prisma.TerminalGetPayload<{
  include: { sim_card: true; agent: { include: { pos: { select: { area_name: true; zone_number: true } } } } };
}>;

const TERMINAL_HEADER =
  'ID REVENDEDOR, AREA, ZONA, Nº DE SERIE DO TERMINAL, Nº DO CARTAO UNITEL, PIN, PUK, Nº DE SERIE DO CHIP, DEVICE ID, ESTADO, DATA DA ACTIVACAO\n';

export async function exportTerminalService(res: Response, filters: PaginationParams) {
  const where = buildTermninalWhereInput(filters);

  res.write(TERMINAL_HEADER);

  let cursor: string | null = null;
  const batchSize = 500;

  while (true) {
    const batch: TerminalWithRelations[] = await prisma.terminal.findMany({
      where,
      take: batchSize,
      skip: cursor ? 1 : 0,
      ...(cursor ? { cursor: { id: cursor } } : {}),
      orderBy: { id: 'desc' },
      include: {
        agent: { include: { pos: { select: { area_name: true, zone_number: true } } } },
        sim_card: true,
      },
    });

    if (batch.length === 0) break;

    for (const terminal of batch) {
      const line = [
        terminal.agent_id_reference,
        terminal?.agent?.pos?.area_name || terminal?.agent?.area,
        terminal?.agent?.pos?.zone_number || terminal?.agent?.zone,
        terminal.agent_id_reference,
        terminal.serial,
        terminal?.sim_card?.number || '',
        terminal?.sim_card?.pin || '',
        terminal?.sim_card?.puk || '',
        terminal?.sim_card?.chip_serial_number || '',
        terminal.device_id,
        terminal.status ? TERMINAL_STATUS[terminal.status].toUpperCase() : '',
        dayjs(terminal.activated_at).format('DD/MM/YYYY') || '',
      ]
        .map(v => `"${v ?? ''}"`)
        .join(',');

      res.write(line + '\n');
    }

    cursor = batch[batch.length - 1].id;
  }

  res.end();
}

const TERMINAL_STATUS: Record<TerminalStatus, string> = {
  maintenance: 'Manutenção',
  training: 'Formação',
  broken: 'Avariado',
  delivered: 'Entregue',
  discontinued: 'Negado',
  on_field: 'Em campo',
  ready: 'Pronto',
  fixed: 'Concertado',
  stock: 'Inventário',
  lost: 'Perdido',
};
