import EventEmitter from 'events';

export const posEmitter = new EventEmitter();

// podes adicionar helpers:
export const posEmitProgress = (data: any) => posEmitter.emit('progress', data);
export const posEmitDone = (data: any) => posEmitter.emit('done', data);
export const posEmitError = (err: any) => posEmitter.emit('error', err);
