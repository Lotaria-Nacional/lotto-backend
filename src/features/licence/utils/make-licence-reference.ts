import { CreateLicenceDTO } from '@lotaria-nacional/lotto';

export const makeLicenceReference = (data: Partial<CreateLicenceDTO>, admin: string) => {
  const { emitted_at, number, description } = data;
  const emitted_at_year = emitted_at?.getFullYear();

  const reference = `${admin}-N${number}-PT${description}-${emitted_at_year}`.toUpperCase();
  return { reference };
};
