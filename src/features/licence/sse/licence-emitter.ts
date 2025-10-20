import EventEmitter from 'events';

export const licenceEmitter = new EventEmitter();

// podes adicionar helpers:
export const licenceEmitProgress = (data: any) => licenceEmitter.emit('progress', data);
export const licenceEmitDone = (data: any) => licenceEmitter.emit('done', data);
export const licenceEmitError = (err: any) => licenceEmitter.emit('error', err);
