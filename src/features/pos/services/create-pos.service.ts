import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { RedisKeys } from '../../../utils/redis/keys';
import { CreatePosDTO } from '../schemas/create-pos.schema';
import { deleteCache } from '../../../utils/redis/delete-cache';

export async function createPosService({ user, ...data }: CreatePosDTO) {
  const response = await prisma.$transaction(async tx => {
    const posCreated = await tx.pos.create({
      data: {
        coordinates: data.coordinates,
        admin_id: data.admin_id,
        province_id: data.province_id,
        city_id: data.city_id,
      },
    });

    await audit(tx, 'CREATE', {
      entity: 'POS',
      user,
      after: posCreated,
      before: null,
    });

    return posCreated.id;
  });

  const promises = [deleteCache(RedisKeys.pos.all()), deleteCache(RedisKeys.auditLogs.all())];

  if (data.admin_id) promises.push(deleteCache(RedisKeys.admins.all()));
  if (data.agent_id) promises.push(deleteCache(RedisKeys.agents.all()));
  if (data.licence_id) promises.push(deleteCache(RedisKeys.licences.all()));

  await Promise.all(promises);

  return response;
}
