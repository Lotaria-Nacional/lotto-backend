import { CreateSimCardDTO } from '@lotaria-nacional/lotto';

export function makeSimCard(override?: Partial<CreateSimCardDTO>) {
  return {
    number: '941685402',
    pin: '1234',
    puk: '1234567',
    ...override,
  } as CreateSimCardDTO;
}
