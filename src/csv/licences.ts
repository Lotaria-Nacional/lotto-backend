import fs from 'fs';
import { once } from 'events';
import { faker } from '@faker-js/faker';

async function gerarDocumentosCSV() {
  console.time('csv');

  const headers =
    'ADMINISTRACAO, COORDENADAS, DESCRICAO, DATA DE EMISSAO, DATA DE EXPIRACAO, LIMITE, Nº DOCUMENTO, REFERENCIA\n';
  const output = 'licences.csv';

  const total = 10_000; // número total de linhas
  const chunkSize = 1000; // quantas linhas por chunk
  const stream = fs.createWriteStream(output);

  stream.write(headers);

  const administracoes = [
    'rangel',
    'maianga',
    'kilamba kiaxi',
    'ingombota',
    'mulenvos',
    'samba',
    'talatona',
    'viana',
    'cacuaco',
    'cazenga',
    'sambizanga',
    'hoji-ya-henda',
  ];

  for (let i = 0; i < total; i += chunkSize) {
    let chunk = '';

    for (let j = 0; j < chunkSize && i + j < total; j++) {
      const administracao = faker.helpers.arrayElement(administracoes);
      const coordenadas = `${faker.location.latitude()} ${faker.location.longitude()}`;
      const descricao = faker.lorem.sentence({ min: 3, max: 4 });
      const dataEmissao = faker.date.past({ years: 10 }).toISOString().split('T')[0];
      const dataExpiracao = faker.date.between({ from: dataEmissao, to: new Date() }).toISOString().split('T')[0];
      const limite = faker.number.int({ min: 1, max: 100 });
      const numeroDocumento = faker.string.alphanumeric(10).toUpperCase();
      const referencia = faker.string.alphanumeric(12).toUpperCase();

      chunk += `${administracao},${coordenadas},${descricao},${dataEmissao},${dataExpiracao},${limite},${numeroDocumento},${referencia}\n`;
    }

    const ok = stream.write(chunk);
    if (!ok) await once(stream, 'drain');

    if (i % total === 0) {
      console.log(`Progresso: ${i}/${total}`);
    }
  }

  stream.end();
  await once(stream, 'finish');

  console.timeEnd('csv');
  console.log(`✅ CSV criado com sucesso: ${output}`);
}

gerarDocumentosCSV().catch(console.error);
