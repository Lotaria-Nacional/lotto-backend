import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

async function downloadData() {
  const data = await prisma.pos.findMany({ include: { agent: true } });
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'POS');
  XLSX.writeFile(workbook, 'pos.xlsx');
}

import { Request, Response } from 'express';
import ExcelJS from 'exceljs';

export async function exportPosStream(req: Request, res: Response) {
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="pos.xlsx"');

  // Workbook em streaming, direcionado para o response
  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: res });
  const worksheet = workbook.addWorksheet('POS');

  // Cabeçalhos
  worksheet
    .addRow(['POS ID', 'Coordinates', 'Status', 'Agent ID', 'Agent Name', 'Licence ID', 'Licence Reference'])
    .commit();

  const pageSize = 1000;
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const posBatch = await prisma.pos.findMany({
      skip: page * pageSize,
      take: pageSize,
      include: { agent: true, licence: true },
      orderBy: { id: 'asc' },
    });

    posBatch.forEach(pos => {
      worksheet
        .addRow([
          pos.id,
          pos.status,
          pos.agent?.id ?? '',
          pos.agent ? `${pos.agent.first_name} ${pos.agent.last_name}` : '',
          pos.licence?.id ?? '',
          pos.licence?.reference ?? '',
        ])
        .commit();
    });

    hasMore = posBatch.length === pageSize;
    page++;
  }

  // Fecha o workbook para finalizar o streaming
  await workbook.commit();

  // Não precisamos fazer res.end(), o ExcelJS faz isso automaticamente
}
