import fs from 'fs';
import dayjs from 'dayjs';
import { Readable } from 'stream';
import csvParser from 'csv-parser';
import prisma from '../../../lib/prisma';
import { detectCsvType } from '../utils/detect-csv-type';

function normalizeId(value?: string | number): string {
  if (!value) return '';
  return String(value).trim().replace(/^0+/, '').toUpperCase();
}

export async function importActivitiesService(
  files: Express.Multer.File[],
  onProgress?: (percent: number) => void
): Promise<void> {
  let totalRecords = 0;
  let processed = 0;

  // --- 1️⃣ Contar linhas para o progresso
  for (const file of files) {
    const buffer = file.buffer?.toString() ?? fs.readFileSync(file.path, 'utf8');
    totalRecords += buffer.split('\n').length - 1;
  }

  // --- 2️⃣ Mapas de dados agregados (como no teu código original)
  const agentsMap = new Map<
    string,
    {
      id: string;
      zone?: string;
      area?: string;
      summary: Map<string, { deposit: number; debt: number }>;
    }
  >();

  // --- 3️⃣ Ler ficheiros e alimentar o mapa
  for (const file of files) {
    const type = await detectCsvType(file);
    const stream = file.buffer ? Readable.from(file.buffer.toString()) : fs.createReadStream(file.path);

    await new Promise<void>((resolve, reject) => {
      stream
        .pipe(csvParser())
        .on('data', async (row) => {
          try {
            if (type === 'AFRIMONEY') {
              const id = normalizeId(row['REMARKS']);
              if (!id) return;

              const dateStr = row['TRANSFER_DATE'];
              const date = dayjs(dateStr, ['YYYY-MM-DD', 'M/D/YY H:mm', 'DD-MM-YYYY']).format('YYYY-MM-DD');
              const deposit = parseFloat(row['TRANSFER_VALUE'] || '0');
              if (!date) return;

              if (!agentsMap.has(id)) {
                agentsMap.set(id, { id, summary: new Map() });
              }

              const agent = agentsMap.get(id)!;
              const entry = agent.summary.get(date) || { deposit: 0, debt: 0 };
              entry.deposit += deposit;
              agent.summary.set(date, entry);
            }

            if (type === 'KORAL-PLAY') {
              const id = normalizeId(row['STAFFREFERENCE']);
              if (!id) return;

              const groupName = (row['GROUPNAME'] || '').trim();
              if (groupName.toUpperCase() === 'SEDE NACIONAL') return;

              const isZona = /^ZONA\s*\d+$/i.test(groupName);
              const isAgencia = /^AGENCIAS?$/i.test(groupName);
              if (!isZona && !isAgencia) return;

              const dateStr = row['DATE'];
              const date = dayjs(dateStr, ['YYYY-MM-DD', 'M/D/YYYY', 'DD-MM-YYYY']).format('YYYY-MM-DD');
              const debt = parseFloat(row['GGR_AMOUNT'] || '0');
              if (!date) return;

              if (!agentsMap.has(id)) {
                agentsMap.set(id, {
                  id,
                  zone: isZona ? groupName : undefined,
                  area: isAgencia ? groupName : undefined,
                  summary: new Map(),
                });
              }

              const agent = agentsMap.get(id)!;
              agent.zone = agent.zone || (isZona ? groupName : undefined);
              agent.area = agent.area || (isAgencia ? groupName : undefined);
              const entry = agent.summary.get(date) || { deposit: 0, debt: 0 };
              entry.debt += debt;
              agent.summary.set(date, entry);
            }

            processed++;
            if (onProgress) {
              const percent = Math.round((processed / totalRecords) * 100);
              onProgress(Math.min(100, percent));
            }
          } catch (err) {
            console.error('Erro ao processar linha:', err);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });
  }

  // --- 4️⃣ Persistir dados no BD
  for (const [id, agent] of agentsMap.entries()) {
    // 4.1️⃣ Criar/atualizar agente
    await prisma.agentActivity.upsert({
      where: { id },
      update: { zone: agent.zone, area: agent.area },
      create: { id, zone: agent.zone, area: agent.area },
    });

    // 4.2️⃣ Calcular saldo acumulado e guardar diários
    const sortedDates = Array.from(agent.summary.keys()).sort();
    let previousBalance = 0;

    for (const date of sortedDates) {
      const { deposit, debt } = agent.summary.get(date)!;
      const balance = previousBalance + debt - deposit;
      previousBalance = balance;

      await prisma.agentDailyBalance.upsert({
        where: { agentId_date: { agentId: id, date: new Date(date) } },
        update: { deposit, debt, balance },
        create: { agentId: id, date: new Date(date), deposit, debt, balance },
      });
    }
  }

  if (onProgress) onProgress(100);
  console.log(`✅ Importação concluída: ${processed}/${totalRecords} processados`);
}
