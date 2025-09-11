import { CreateLicenceDTO } from '@lotaria-nacional/lotto';
import { adminId } from '../setup';

export function makeLicence(override?: Partial<CreateLicenceDTO>) {
  return {
    number: 'numb-example',
    description: 'desc-example',
    admin_id: adminId,
    limit: 2,
    emitted_at: new Date('2025-08-10'),
    expires_at: new Date('2026-08-11'),
    ...override,
  } as CreateLicenceDTO;
}
