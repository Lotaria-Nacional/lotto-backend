import EventEmitter from 'events';

export const progressEmitter = new EventEmitter();

// podes adicionar helpers:
export const emitProgress = (data: any) => progressEmitter.emit('progress', data);
export const emitDone = (data: any) => progressEmitter.emit('done', data);
export const emitError = (err: any) => progressEmitter.emit('error', err);
