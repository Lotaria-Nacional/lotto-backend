export function connectIfDefined(field: string, id: number | string | null | undefined) {
  return id ? { [field]: { connect: { id } } } : {};
}

export function connectOrDisconnect(field: string, id: number | string | null | undefined) {
  return id ? { [field]: { connect: { id } } } : { [field]: { disconnect: true } };
}
