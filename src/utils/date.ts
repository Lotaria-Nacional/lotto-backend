export const oneDayFromNowInMs = 24 * 60 * 60 * 1000;

export function transformDate(val?: string) {
  if (!val || val.trim() === '') {
    // Gera uma data aleatória caso não exista
    const year = new Date().getFullYear();
    const month = Math.floor(Math.random() * 12);
    const day = Math.floor(Math.random() * 28) + 1;
    return new Date(year, month, day);
  }

  let day: number, month: number, year: number;

  if (/^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(val)) {
    // YYYY-MM-DD ou YYYY/MM/DD
    [year, month, day] = val.split(/[-/]/).map(Number);
  } else if (/^\d{1,2}[\/-]\d{1,2}[\/-]\d{4}$/.test(val)) {
    // D/M/YYYY ou DD/MM/YYYY ou D/MM/YYYY etc
    [day, month, year] = val.split(/[-/]/).map(Number);
  } else {
    // formato inválido: gera data aleatória
    const currentYear = new Date().getFullYear();
    const randomMonth = Math.floor(Math.random() * 12);
    const randomDay = Math.floor(Math.random() * 28) + 1;
    return new Date(currentYear, randomMonth, randomDay);
  }

  return new Date(year, month - 1, day);
}
