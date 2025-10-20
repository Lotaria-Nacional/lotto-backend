import fs from 'fs';
import { once } from 'events';
import { faker } from '@faker-js/faker';

async function gerarCSV() {
  console.time('csv');

  const headers = 'ID REVENDEDOR,Nº DE SERIE,DEVICE ID,ESTADO,DATA DE ENTRADA,DATA DE SAIDA,Nº TELEFONE,PIN,PUK\n';
  const output = 'terminais.csv';

  const total = 10_000; // número total de linhas
  const chunkSize = 1000; // quantas linhas escrever por chunk
  const stream = fs.createWriteStream(output);

  stream.write(headers);

  for (let i = 0; i < total; i += chunkSize) {
    let chunk = '';

    for (let j = 0; j < chunkSize && i + j < total; j++) {
      const idRevendedor = '';
      const serial = faker.string.nanoid();
      const deviceID = faker.string.nanoid();
      const estado = faker.helpers.arrayElement(['activo', 'avariado', 'inventario']);
      const dataEntrada = faker.date.past({ years: 5 }).toISOString().split('T')[0];
      const dataSaida =
        faker.helpers.maybe(
          () => faker.date.between({ from: dataEntrada, to: new Date() }).toISOString().split('T')[0],
          { probability: 0.3 } // 30% dos dispositivos têm data de saída
        ) ?? '';
      const telefone = faker.phone.number({ style: 'international' });
      const pin = faker.number.int({ min: 1000, max: 9999 }); // 4 dígitos
      const puk = faker.number.int({ min: 10000000, max: 99999999 }); // 8 dígitos

      chunk += `${idRevendedor},${serial},${deviceID},${estado},${dataEntrada},${dataSaida},${telefone},${pin},${puk}\n`;
    }

    const ok = stream.write(chunk);
    if (!ok) await once(stream, 'drain');

    if (i % 2000 === 0) {
      console.log(`Progresso: ${i}/${total}`);
    }
  }

  stream.end();
  await once(stream, 'finish');

  console.timeEnd('csv');
  console.log(`✅ CSV criado com sucesso: ${output}`);
}

gerarCSV().catch(console.error);
