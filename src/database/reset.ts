import { Prisma } from '@prisma/client';

export async function resetDatabase(tx: Prisma.TransactionClient) {
  await tx.membership.deleteMany();
  await tx.groupPermission.deleteMany();
  await tx.idReference.deleteMany();

  await tx.simCard.deleteMany();
  await tx.licence.deleteMany();
  await tx.terminal.deleteMany();
  await tx.agent.deleteMany();
  await tx.pos.deleteMany();

  await tx.city.deleteMany();
  await tx.province.deleteMany();
  await tx.subtype.deleteMany();
  await tx.type.deleteMany();
  await tx.zone.deleteMany();
  await tx.area.deleteMany();
  await tx.administration.deleteMany();

  await tx.group.deleteMany();
  await tx.user.deleteMany();
}
