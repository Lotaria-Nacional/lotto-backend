import { CreateTerminalDTO, UpdateTerminalDTO } from '@lotaria-nacional/lotto';

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
