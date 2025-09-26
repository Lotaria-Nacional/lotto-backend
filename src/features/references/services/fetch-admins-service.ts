import { Prisma } from '@prisma/client';
import prisma from '../../../lib/prisma';
import { PaginationParams } from '../../../@types/pagination-params';

export async function fetchManyAdminsService(params: PaginationParams) {
  let where: Prisma.AdministrationWhereInput = {};

  if (params.query) {
    where = {
      name: {
        contains: params.query,
        mode: 'insensitive',
      },
    };
  }

  const admins = await prisma.administration.findMany({
    where,
    include: {
      cities: true,
      licences: true,
      pos: true,
    },
  });

  return admins;
}
