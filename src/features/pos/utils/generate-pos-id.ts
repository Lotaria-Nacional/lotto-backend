import { ACRONYMS } from '../constants';
import prisma from '../../../lib/prisma';

export async function generatePosID(province: string) {
  const prov = province.toLowerCase().replace(/\s+/g, '_');
  const acronym = ACRONYMS[prov] || 'UNKNOWN';

  const lastPos = await prisma.pos.findFirst({
    where: {
      id: {
        startsWith: `PDV-${acronym}-`,
      },
    },
    orderBy: {
      created_at: 'desc',
    },
    select: { id: true },
  });

  let nextNumber = 1;

  if (lastPos?.id) {
    const match = lastPos.id.match(/PDV-[A-Z]{2}-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  const number = String(nextNumber).padStart(4, '0');
  return `PDV-${acronym}-${number}`;
}
