export const oneDayFromNowInMs = 24 * 60 * 60 * 1000;

export function parseFlexibleDate(val?: string | null): Date | undefined {
  if (!val) return undefined;

  // Remover espaços extras
  val = val.trim();

  // Padrão DD/MM/YYYY ou DD-MM-YYYY
  let match = val.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})$/);
  if (match) {
    const [_, day, month, year] = match;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  // Padrão YYYY/MM/DD ou YYYY-MM-DD
  match = val.match(/^(\d{4})[\/-](\d{2})[\/-](\d{2})$/);
  if (match) {
    const [_, year, month, day] = match;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  // Se não casar com nenhum padrão, tentar Date nativo
  const d = new Date(val);
  if (!isNaN(d.getTime())) return d;

  // Se ainda assim falhar, retorna undefined
  return undefined;
}
