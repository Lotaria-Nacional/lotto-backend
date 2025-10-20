import fs from 'fs';
import { once } from 'events';
import { faker } from '@faker-js/faker';

async function gerarAgentesCSV() {
  console.time('csv');

  const headers = 'ID,NOME,SOBRENOME,GENERO,DATA_FORMACAO,ESTADO,TELEFONE,BI\n';
  const output = 'agentes.csv';

  const total = 10_000; // total de linhas
  const chunkSize = 1000; // linhas por chunk

  const stream = fs.createWriteStream(output);
  stream.write(headers);

  for (let i = 0; i < total; i += chunkSize) {
    let chunk = '';

    for (let j = 0; j < chunkSize && i + j < total; j++) {
      const id = (() => {
        const prefix = faker.helpers.arrayElement(['1', '9']);
        const suffix = faker.number.int({ min: 0, max: 99999 }).toString().padStart(5, '0');
        return `${prefix}${suffix}`;
      })();
      const nome = faker.person.firstName();
      const sobrenome = faker.person.lastName();
      const genero = faker.helpers.arrayElement(['m', 'masculino', 'f', 'feminino']);
      const dataFormacao = faker.date.past({ years: 10 }).toISOString().split('T')[0];
      const estado = faker.helpers.arrayElement(['agendado', 'activo', 'negado', 'apto']);
      const telefone = faker.phone.number({ style: 'international' });
      const bi = faker.string.alphanumeric(14).toUpperCase();

      chunk += `${id},${nome},${sobrenome},${genero},${dataFormacao},${estado},${telefone},${bi}\n`;
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
