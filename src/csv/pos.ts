import fs from 'fs';
import { once } from 'events';
import { faker } from '@faker-js/faker';

async function gerarAgentesCSV() {
  console.time('csv');

  const headers = 'ID REVENDEDOR,AREA,ZONA,ESTADO,TIPOLOGIA,LICENÇA,COORDENADAS,PROVINCIA,ADMINISTRACAO,CIDADE\n';
  const output = 'pos.csv';

  const total = 10_000; // número total de linhas
  const chunkSize = 1000; // número de linhas por chunk
  const stream = fs.createWriteStream(output);

  stream.write(headers);

  const estados = ['activo', 'negado'];
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
  const cidades = [
    'ingombota',
    'mutamba',
    'samba',
    'morro bento',
    'nova vida',
    'talatona',
    'patriota',
    'benfica',
    'fubu',
    'calemba 2',
    'camama',
    'viana',
    'palanca',
    'mulenvos',
    'cazenga',
    'sao paulo',
    'kikolo',
    'sambizanga',
    'cacuaco',
    'quifangondo',
    'belo monte',
    'capalanga',
    'luanda sul',
    'zango',
  ];

  const areas = ['area a', 'area b', 'area c', 'area d', 'area e', 'area f'];
  const zonas = Array.from({ length: 24 }, (_, i) => `zona ${i + 1}`);
  const tipos = [
    'ambulante',
    'popupkit',
    'comércio',
    'supermercado',
    'quiosque',
    'arreiou',
    'kibabo',
    'angomart',
    'nossa casa',
    'viana',
    'morro bento',
    'talatona',
    'palanca',
    'nova vida',
    'patriota',
    'cacuaco',
    'benfica',
    'samba',
    'mulenvos',
    'bancada',
    'roulote',
  ];

  for (let i = 0; i < total; i += chunkSize) {
    let chunk = '';

    for (let j = 0; j < chunkSize && i + j < total; j++) {
      const idAgente = '';
      const area = faker.helpers.arrayElement(areas);
      const zona = faker.helpers.arrayElement(zonas);
      const estado = faker.helpers.arrayElement(estados);
      const tipo = faker.helpers.arrayElement(tipos);
      const licenca = faker.helpers.maybe(() => faker.string.alphanumeric(8).toUpperCase(), { probability: 0.5 }) || '';
      const coordenadas = `${faker.location.latitude()}; ${faker.location.longitude()}`;
      const provincia = 'luanda';
      const administracao = faker.helpers.arrayElement(administracoes);
      const cidade = faker.helpers.arrayElement(cidades);

      chunk += `${idAgente},${area},${zona},${estado},${tipo},${licenca},${coordenadas},${provincia},${administracao},${cidade}\n`;
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

gerarAgentesCSV().catch(console.error);
