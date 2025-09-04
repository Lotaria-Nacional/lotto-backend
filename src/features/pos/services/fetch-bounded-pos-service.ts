import prisma from '../../../lib/prisma';
import { BoundedBoxSchemaDTO } from '../schemas/bounds';

export async function fecthBoundedPosService(bounds: BoundedBoxSchemaDTO) {
  const pos = await prisma.pos.findMany({
    where: {},
  });

  return pos;
}
