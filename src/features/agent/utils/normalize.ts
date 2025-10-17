export function normalizeDate(dateStr: string): string {
  if (!dateStr) return '';

  // Afrimoney: "4/10/25 0:00"
  if (dateStr.includes(':')) {
    const [mdy] = dateStr.split(' ');
    const [month, day, year] = mdy.split('/');
    const fullYear = year.length === 2 ? `20${year}` : year;
    return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Koral: "3/31/2025"
  if (dateStr.includes('/')) {
    const [month, day, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return dateStr; // fallback
}
