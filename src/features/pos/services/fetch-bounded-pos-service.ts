import z from 'zod';
import prisma from '../../../lib/prisma';
import { BoundedBoxSchemaDTO } from '@lotaria-nacional/lotto';

export async function fecthBoundedPosService({ minLat, maxLat, minLng, maxLng }: BoundedBoxSchemaDTO) {
  const pos = await prisma.pos.findMany({
    take: 40,
    where: {
      AND: [
        {
          status: {
            in: ['active', 'approved'],
          },
        },
        {
          latitude: { gte: minLat, lte: maxLat },
          longitude: { gte: minLng, lte: maxLng },
        },
      ],
    },
    orderBy: {
      created_at: 'desc',
    },
    select: {
      latitude: true,
      longitude: true,
      licence: {
        select: {
          admin: { select: { name: true } },
          reference: true,
        },
      },
      agent: {
        select: {
          id: true,
          id_reference: true,
          first_name: true,
          last_name: true,
          terminal: { select: { id: true, serial: true } },
        },
      },
      admin: true,
      area: true,
      zone: true,
      type: true,
      subtype: true,
      province: true,
      city: true,
    },
  });

  return pos;
}
