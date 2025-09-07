import prisma from '../../../lib/prisma';
import { NotFoundError } from '../../../errors';
import { audit } from '../../../utils/audit-log';
import { RedisKeys } from '../../../utils/redis';
import { UpdatePosDTO } from '../schemas/update.schema';
import { deleteCache } from '../../../utils/redis/delete-cache';

export async function updatePosService(data: UpdatePosDTO) {
  await prisma.$transaction(async tx => {
    const pos = await tx.pos.findUnique({ where: { id: data.id } });

    if (!pos) throw new NotFoundError('POS não encontrado.');

    if (data.agent_id) {
      const agent = await tx.agent.findUnique({
        where: { id: data.agent_id },
      });

      if (!agent) {
        throw new NotFoundError('Agente não encontrado.');
      }

      await tx.agent.update({
        where: { id: agent.id },
        data: {
          status: 'active',
        },
      });
    }

    const after = await tx.pos.update({
      where: { id: data.id },
      data: {
        agent_id: data.agent_id,
        licence_id: data.licence_id,
        coordinates: data.coordinates,
        status: data.agent_id ? 'active' : pos.status,
        area_id: data.area_id,
        zone_id: data.zone_id,
        type_id: data.type_id,
        subtype_id: data.subtype_id,
        admin_id: data.admin_id,
        province_id: data.province_id,
        city_id: data.city_id,
      },
    });

    await audit(tx, 'UPDATE', {
      user: data.user,
      entity: 'POS',
      before: pos,
      after,
    });
  });

  const promises = [deleteCache(RedisKeys.pos.all()), deleteCache(RedisKeys.auditLogs.all())];

  if (data.admin_id) promises.push(deleteCache(RedisKeys.admins.all()));
  if (data.agent_id) promises.push(deleteCache(RedisKeys.agents.all()));
  if (data.licence_id) promises.push(deleteCache(RedisKeys.licences.all()));

  await Promise.all(promises);
}
