import EventEmitter from 'events';

export const terminalEmitter = new EventEmitter();

// podes adicionar helpers:
export const terminalEmitProgress = (data: any) => terminalEmitter.emit('progress', data);
export const terminalEmitDone = (data: any) => terminalEmitter.emit('done', data);
export const terminalEmitError = (err: any) => terminalEmitter.emit('error', err);
