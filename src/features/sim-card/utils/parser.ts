import * as fs from 'fs';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';

export async function parseCsvSimCards(filePath: string) {
  const file = fs.readFileSync(filePath, 'utf8');
  const parsed = Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length) {
    throw new Error('Erro ao parsear CSV: ' + JSON.stringify(parsed.errors));
  }

  return parsed.data;
}

export async function parseExcelSimCards(filePath: string) {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(sheet);
  return jsonData;
}
