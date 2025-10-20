import fs from 'fs';
import { once } from 'events';
import { faker } from '@faker-js/faker';
import { gerarDatas } from './koral-play';

// TRANSFER DATE, REMARKS ,TRANSFER, VALUE, DATE

async function gerarAfrimoneyCSV() {
  console.time('csv');

  const headers = 'TRANSFER_DATE,REMARKS,TRANSFER_VALUE,DATE\n';
  const output = 'afrimoney.csv';

  const total = 120; // total de linhas
  const chunkSize = 10; // linhas por chunk
  const datas = gerarDatas(total);

  const stream = fs.createWriteStream(output);
  stream.write(headers);

  for (let i = 0; i < total; i += chunkSize) {
    let chunk = '';

    for (let j = 0; j < chunkSize && i + j < total; j++) {
      const transferDate = datas[i + j]; // usa a data do array;
      const remarks = (() => {
        const prefix = faker.helpers.arrayElement(['1', '9']);
        const suffix = faker.number.int({ min: 0, max: 99999 }).toString().padStart(5, '0');
        return `${prefix}${suffix}`;
      })();
      const date = datas[i + j]; // usa a data do array;
      const transferValue = faker.finance.amount({ dec: 0 });

      chunk += `${transferDate},${remarks},${transferValue},${date},\n`;
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

gerarAfrimoneyCSV().catch(console.error);
