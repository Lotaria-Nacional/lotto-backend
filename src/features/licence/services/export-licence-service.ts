import { Response } from 'express';
import { Licence } from '@prisma/client';
import prisma from '../../../lib/prisma';
import { buildLicenceWhereInput } from '../utils/filters';
import { PaginationParams } from '../../../@types/pagination-params';

export async function exportLicencesService(res: Response, filters: PaginationParams) {
  // Gerar WHERE com base nos filtros já existentes
  const where = buildLicenceWhereInput(filters);

  // Cabeçalho CSV
  res.write(
    `ADMINISTRACAO, COORDENAFAS, DESCRICAO, DATA DE EMISSAO, DATA DE EXPIRACAO, LIMITE, Nº DOCUMENTO, REFERENCIA\n`
  );

  let cursor: string | null = null;
  const batchSize = 500;

  while (true) {
    const batch: Licence[] = await prisma.licence.findMany({
      take: batchSize,
      skip: cursor ? 1 : 0,
      ...(cursor ? { cursor: { id: cursor } } : {}),
      orderBy: { id: 'asc' },
      where,
    });

    if (batch.length === 0) break;

    for (const licence of batch) {
      //   const status = licence.status === 'free' ? 'Livre' : 'Ocupado';

      const line = [
        licence.admin_name,
        licence.coordinates,
        licence.description,
        licence.emitted_at?.toISOString().split('T')[0],
        licence.expires_at?.toISOString().split('T')[0],
        licence.limit,
        licence.number,
        licence.reference,
      ]
        .map((v) => `"${v ?? ''}"`)
        .join(',');

      res.write(line + '\n');
    }

    cursor = batch[batch.length - 1].id;
  }

  res.end();
}
