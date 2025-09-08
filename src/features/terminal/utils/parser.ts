import * as fs from 'fs';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';

export async function parseCsvTerminals(filePath: string) {
  const file = fs.readFileSync(filePath, 'utf8');

  const parsed = Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length) {
    throw new Error('Erro ao parsear CSV: ' + JSON.stringify(parsed.errors));
  }

  // Converte datas
  const data = parsed.data.map((row: any) => ({
    ...row,
    arrived_at: row.arrived_at ? new Date(row.arrived_at) : undefined,
    leaved_at: row.leaved_at ? new Date(row.leaved_at) : undefined,
  }));

  return data;
}

export async function parseExcelTerminals(filePath: string) {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json(sheet);

  const data = rawData.map((row: any) => ({
    ...row,
    arrived_at: row.arrived_at ? new Date(row.arrived_at) : undefined,
    leaved_at: row.leaved_at ? new Date(row.leaved_at) : undefined,
  }));

  return data;
}
