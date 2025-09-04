import { CreatePosDTO } from '../../src/features/pos/schemas/create-pos.schema';
import { adminId, cityId, provinceId } from '../setup';

export function makePos(override?: Partial<CreatePosDTO>) {
  return {
    coordinates: '12,1234567,-13,12435678',
    admin_id: adminId,
    province_id: provinceId,
    city_id: cityId,
    ...override,
  } as CreatePosDTO;
}
