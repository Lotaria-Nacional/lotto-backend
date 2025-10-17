import fs from 'fs';
import dayjs from 'dayjs';
import { Readable } from 'stream';
import csvParser from 'csv-parser';
import prisma from '../../../lib/prisma';
import { detectCsvType } from '../utils/detect-csv-type';
import { auditImport } from '../../../utils/import-utils';
import { AuthPayload } from '@lotaria-nacional/lotto';

export async function importActivitiesService(files: Express.Multer.File[], user: AuthPayload) {
  let totalRecords = 0;
  let processed = 0;

  for (const file of files) {
    const buffer = file.buffer?.toString() ?? fs.readFileSync(file.path, 'utf8');
    totalRecords += buffer.split('\n').length - 1;
  }

  const agentsMap = new Map<
    string,
    {
      id: string;
      zone?: string;
      area?: string;
      summary: Map<string, { deposit: number; debt: number }>;
    }
  >();

  for (const file of files) {
    const type = await detectCsvType(file);
    const stream = file.buffer ? Readable.from(file.buffer.toString()) : fs.createReadStream(file.path);

    await new Promise<void>((resolve, reject) => {
      stream
        .pipe(csvParser())
        .on('data', async row => {
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
          } catch (err) {
            console.error('Erro ao processar linha:', err);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });
  }

  for (const [id, agent] of agentsMap.entries()) {
    await prisma.agentActivity.upsert({
      where: { id },
      update: { zone: agent.zone, area: agent.area },
      create: { id, zone: agent.zone, area: agent.area },
    });

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

  for (const file of files) {
    const importedRecords = processed; // ou contar os inserts reais no Prisma

    await auditImport({
      user,
      file: file.buffer,
      imported: importedRecords,
      entity: 'AGENT',
      desc: 'históricos de actividade',
    });
  }
}

function normalizeId(value?: string | number): string {
  if (!value) return '';
  return String(value).trim().replace(/^0+/, '').toUpperCase();
}
