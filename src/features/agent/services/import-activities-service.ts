import fs from 'fs';
import dayjs from 'dayjs';
import { Readable } from 'stream';
import csvParser from 'csv-parser';
import prisma from '../../../lib/prisma';
import { detectCsvType } from '../utils/detect-csv-type';
import { AuthPayload } from '@lotaria-nacional/lotto';
import uploadCsvToImageKit from '../../../utils/upload-csv-to-image-kit';
import { audit } from '../../../utils/audit-log';

export async function importActivitiesService(files: Express.Multer.File[], user: AuthPayload) {
  const allCities = await prisma.city.findMany({
    include: { area: true, zone: true },
  });

  let totalProcessed = 0;
  let totalRecords = 0;

  for (const file of files) {
    const buffer = file.buffer?.toString() ?? fs.readFileSync(file.path, 'utf8');
    const numLines = buffer.split('\n').length - 1;
    totalRecords += numLines;

    // ✅ Detectar tipo de CSV
    const type = await detectCsvType(file);
    const stream = file.buffer ? Readable.from(file.buffer.toString()) : fs.createReadStream(file.path);

    console.log(type);

    const agentsMap = new Map<
      string,
      {
        id: string;
        zone?: string;
        area?: string;
        summary: Map<string, { deposit: number; debt: number }>;
      }
    >();

    let processedInFile = 0;

    await new Promise<void>((resolve, reject) => {
      stream
        .pipe(csvParser())
        .on('data', async row => {
          try {
            // ------------------- AFRIMONEY -------------------
            if (type === 'AFRIMONEY') {
              const id = normalizeId(row['REMARKS']);
              if (!id || !isValidSixDigitId(id)) return;

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

            // ------------------- KORAL-PLAY -------------------
            if (type === 'KORAL-PLAY') {
              const id = normalizeId(row['STAFFREFERENCE']);
              if (!id || !isValidSixDigitId(id)) return;

              const groupName = (row['GROUPNAME'] || '').trim();
              if (groupName.toUpperCase() === 'SEDE NACIONAL') return;

              const isZona = /^ZONA\s*\d+$/i.test(groupName);
              const isAgencia = /^AGENCIAS?$/i.test(groupName);
              if (!isZona && !isAgencia) return;

              const dateStr = row['DATE'];
              const date = dayjs(dateStr, ['YYYY-MM-DD', 'M/D/YYYY', 'DD-MM-YYYY']).format('YYYY-MM-DD');
              const debt = parseFloat(row['GGR_AMOUNT'] || '0');
              if (!date) return;

              const zoneNumber = isZona ? parseInt(groupName.replace(/[^0-9]/g, ''), 10) : undefined;
              const zoneLabel = zoneNumber ? `ZONA ${zoneNumber}` : undefined;

              // ✅ Buscar área a partir da zona
              let areaFromDb: string | undefined;
              if (zoneNumber) {
                const city = allCities.find(c => c.zone?.number === zoneNumber);
                if (city?.area?.name) {
                  areaFromDb = `AREA ${city.area.name.toUpperCase()}`;
                }
              }

              // ✅ Criar/atualizar agente
              if (!agentsMap.has(id)) {
                agentsMap.set(id, {
                  id,
                  zone: isZona ? zoneLabel : undefined,
                  area: isAgencia ? `AREA ${groupName}` : areaFromDb,
                  summary: new Map(),
                });
              }

              const agent = agentsMap.get(id)!;
              agent.zone = agent.zone || (isZona ? zoneLabel : undefined);
              agent.area = agent.area || (isAgencia ? `AREA ${groupName}` : areaFromDb);

              const entry = agent.summary.get(date) || { deposit: 0, debt: 0 };
              entry.debt += debt;
              agent.summary.set(date, entry);
            }

            processedInFile++;
          } catch (err) {
            console.error('Erro ao processar linha:', err);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // ✅ Persistência no banco
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

    // ✅ Audit log detalhado por tipo
    // const url = await uploadCsvToImageKit(file.path);
    // await prisma.$transaction(async tx => {
    //   await audit(tx, 'IMPORT', {
    //     user,
    //     before: null,
    //     after: null,
    //     entity: 'AGENT',
    //     description: `Importação de atividades ${type} (${processedInFile})`,
    //     metadata: {
    //       file: url,
    //     },
    //   });
    // });

    totalProcessed += processedInFile;
  }

  return {
    totalProcessed,
    totalRecords,
    message: `Importação concluída com sucesso (${totalProcessed}/${totalRecords} linhas processadas em ${files.length} ficheiro(s)).`,
  };
}

/** Normaliza o ID removendo espaços e zeros à esquerda */
function normalizeId(value?: string | number): string {
  if (!value) return '';
  return String(value).trim().replace(/^0+/, '').toUpperCase();
}

/** Verifica se o ID tem exatamente 6 dígitos numéricos */
function isValidSixDigitId(id: string): boolean {
  return /^\d{6}$/.test(id);
}
