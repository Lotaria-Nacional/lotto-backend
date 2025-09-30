export function createSlug(value: string) {
  return value
    .toLocaleLowerCase()
    .normalize('NFD') // separa acentos
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .trim()
    .replace(/\s+/g, '-') // espaços -> hífen
    .replace(/[^a-z0-9-]/g, '') // remove caracteres especiais
    .replace(/-+/g, '-') // hífens duplos
    .replace(/^-+|-+$/g, ''); // hífens início/fim
}

export function normalizeArea(input: string): string | undefined {
  if (!input) return;

  return input
    .toUpperCase()
    .replace(/^AREA\s*/i, '') // remove a palavra "AREA" no início, se existir
    .trim(); // remove espaços restantes
}

export function normalizeZone(input: string | number): number {
  return Number(
    String(input)
      .replace(/\D/g, '') // remove tudo que não for dígito
      .trim()
  );
}
