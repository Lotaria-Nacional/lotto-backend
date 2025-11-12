import { ACRONYMS } from '../constants';
import { Prisma, PrismaClient } from '@prisma/client';

interface Props {
  tx: Prisma.TransactionClient;
  province: string;
  area: string;
  zone: number;
}

export async function generatePosID({ tx, province, area, zone }: Props) {
  const prov = province.toLowerCase().replace(/\s+/g, '_');
  const acronym = ACRONYMS[prov] || 'UNKNOWN';
  const normalizedArea = area.replace(/\s+/g, '').toUpperCase();

  const lastPos = await tx.pos.findFirst({
    where: {
      pos_id: {
        startsWith: `PDV-${acronym}-${normalizedArea}`,
      },
    },

    orderBy: { created_at: 'desc' },
    select: { pos_id: true },
  });

  let nextNumber = 1;

  if (lastPos?.pos_id) {
    const match = lastPos.pos_id.match(/PDV-[A-Z]{2}-[A-Z]+-[0-9]{1,2}-(\d+)/);
    if (match) nextNumber = parseInt(match[1], 10) + 1;
  }

  const number = String(nextNumber).padStart(4, '0');
  return `PDV-${acronym}-${normalizedArea}-${zone}-${number}`;
}
