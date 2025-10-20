import fs from 'fs';
import { once } from 'events';
import { faker } from '@faker-js/faker';

// DATE, GROUPID, GROUPNAME, STAFFID, STAFFNAME, STAFFREFERENCE, GGR_AMOUNT

async function gerarKoralPlayCSV() {
  console.time('csv');

  const headers = 'DATE,GROUPNAME,STAFFNAME,STAFFREFERENCE,GGR_AMOUNT\n';
  const output = 'koral-play.csv';

  const total = 120; // total de linhas
  const chunkSize = 10; // linhas por chunk
  const datas = gerarDatas(total);

  const stream = fs.createWriteStream(output);
  stream.write(headers);

  const zonas = Array.from({ length: 24 }, (_, i) => `zona ${i + 1}`);

  for (let i = 0; i < total; i += chunkSize) {
    let chunk = '';

    for (let j = 0; j < chunkSize && i + j < total; j++) {
      const staffReference = (() => {
        const prefix = faker.helpers.arrayElement(['1', '9']);
        const suffix = faker.number.int({ min: 0, max: 99999 }).toString().padStart(5, '0');
        return `${prefix}${suffix}`;
      })();
      const date = datas[i + j]; // usa a data do array
      const groupName = faker.helpers.arrayElement(zonas);
      const staffName = faker.person.fullName();
      const ggrAmount = faker.finance.amount({ dec: 0 });

      chunk += `${date},${groupName},${staffName},${staffReference},${ggrAmount}\n`;
    }

    const ok = stream.write(chunk);
    if (!ok) await once(stream, 'drain');

    if (i % 100_000 === 0) {
      console.log(`Progresso: ${i}/${total}`);
    }
  }

  stream.end();
  await once(stream, 'finish');

  console.timeEnd('csv');
  console.log(`✅ CSV criado com sucesso: ${output}`);
}

gerarKoralPlayCSV().catch(console.error);

export function gerarDatas(total: number, startDate: Date = new Date()) {
  const datas: string[] = [];
  let current = new Date(startDate.getFullYear(), startDate.getMonth(), 3); // dia 3 do mês inicial

  while (datas.length < total) {
    const ano = current.getFullYear();
    const mes = current.getMonth();
    const diasNoMes = new Date(ano, mes + 1, 0).getDate(); // últimos dia do mês

    for (let dia = 3; dia <= diasNoMes; dia++) {
      datas.push(new Date(ano, mes, dia).toISOString().split('T')[0]);
      if (datas.length >= total) break;
    }

    // Vai para o próximo mês
    current = new Date(ano, mes + 1, 3);
  }

  return datas;
}
