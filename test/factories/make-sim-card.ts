import { CreateSimCardDTO } from '../../src/features/sim-card/schemas/create-sim-card.schema';

export function makeSimCard(override?: Partial<CreateSimCardDTO>) {
  return {
    number: 941685402,
    pin: 1234,
    puk: 1234567,
    ...override,
  } as CreateSimCardDTO;
}
