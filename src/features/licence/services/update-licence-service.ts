import prisma from '../../../lib/prisma';
import { audit } from '../../../utils/audit-log';
import { UpdateLicenceDTO } from '@lotaria-nacional/lotto';
import { AuthPayload } from '../../../@types/auth-payload';
import { BadRequestError, NotFoundError } from '../../../errors';
import { makeLicenceReference } from '../utils/make-licence-reference';

export async function updateLicenceService(data: UpdateLicenceDTO & { user: AuthPayload }) {
  await prisma.$transaction(async (tx) => {
    const licence = await tx.licence.findUnique({
      where: { id: data.id },
      include: { pos: { select: { id: true } } },
    });

    if (!licence) throw new NotFoundError('Licença não encontrada');

    const admin = await tx.administration.findUnique({
      where: { name: data.admin_name },
    });

    if (!admin) throw new NotFoundError('Administração não encontrada');

    const currentPosCount = licence.pos.length;
    const newLimit: number = data.limit ?? licence.limit;

    if (newLimit < currentPosCount) {
      throw new BadRequestError(
        `Não é possível definir o limite para ${newLimit} pois já existem ${currentPosCount} POS associados a esta licença.`
      );
    }

    const { reference } = makeLicenceReference(data, admin.name);

    const usedPosCount = licence.pos.length;
    const newStatus: 'free' | 'used' = usedPosCount >= newLimit ? 'used' : 'free';

    const licenceUpdated = await tx.licence.update({
      where: { id: data.id },
      data: {
        reference,
        number: data.number,
        latitude: data.latitude,
        longitude: data.longitude,
        coordinates: data.coordinates,
        description: data.description,
        emitted_at: data.emitted_at,
        expires_at: data.expires_at,
        limit: data.limit,
        status: newStatus,
        admin_name: data.admin_name,
      },
    });

    await audit(tx, 'UPDATE', {
      user: data.user,
      entity: 'LICENCE',
      before: licence,
      after: licenceUpdated,
      description: `Atualizou os dados de uma licença`,
    });
  });
}
