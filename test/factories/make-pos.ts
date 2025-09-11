import { CreatePosDTO } from '@lotaria-nacional/lotto';
import { adminId, cityId, provinceId } from '../setup';

export function makePos(override?: Partial<CreatePosDTO>) {
  return {
    latitude: 12.1234567,
    longitude: -13.12435678,
    admin_id: adminId,
    province_id: provinceId,
    city_id: cityId,
    ...override,
  } as CreatePosDTO;
}
