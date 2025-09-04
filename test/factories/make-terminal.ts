import { CreateTerminalDTO } from '../../src/features/terminal/schemas/create-terminal.schema';
import { UpdateTerminalDTO } from '../../src/features/terminal/schemas/update-terminal.schema';

export function makeTerminal(override?: Partial<CreateTerminalDTO>) {
  return {
    serial: 'serial-number-example',
    arrived_at: new Date(),
    device_id: 'device-id-example',
    ...override,
  } as CreateTerminalDTO;
}

export function updateTerminal(override?: Partial<UpdateTerminalDTO>) {
  return {
    ...override,
  };
}
