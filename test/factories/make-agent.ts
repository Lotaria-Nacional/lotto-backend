import { CreateAgentDTO } from '../../src/features/agent/schemas/create-agent.schema';

export function makeAgent(override?: Partial<CreateAgentDTO>) {
  return {
    first_name: 'Paulo',
    last_name: 'Luguenda',
    bi_number: '0123456789LA10',
    genre: 'male',
    type: 'lotaria_nacional',
    training_date: new Date('2025-08-10'),
    phone_number: 941685402,
    ...override,
  } as CreateAgentDTO;
}
