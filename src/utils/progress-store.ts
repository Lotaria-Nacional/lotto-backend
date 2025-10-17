// Simples "store" em memória para progresso
export const progressStore = new Map<string, number>();

export function setProgress(uploadId: string, value: number) {
  progressStore.set(uploadId, value);
}

export function getProgress(uploadId: string): number {
  return progressStore.get(uploadId) ?? 0;
}

export function clearProgress(uploadId: string) {
  progressStore.delete(uploadId);
}
