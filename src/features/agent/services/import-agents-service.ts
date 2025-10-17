import fs from 'fs';
import { ZodError } from 'zod';
import csvParser from 'csv-parser';
import prisma from '../../../lib/prisma';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { auditImport } from '../../../utils/import-utils';
import { processBatchAgents } from '../utils/process-batch-agents';
import { ImportAgentDTO, importAgentsSchema } from '../validation/import-agent-schema';

export async function importAgentsFromCsvService(file: string, user: AuthPayload) {
  const errors: any[] = [];
  let imported = 0;
  const BATCH_SIZE = 500;

  const stream = fs.createReadStream(file).pipe(csvParser());
  const agentsBatch: ImportAgentDTO[] = [];

  for await (const row of stream) {
    try {
      const input: ImportAgentDTO = {
        id_reference: row['ID'],
        name: row['NOME'],
        last_name: row['SOBRENOME'],
        gender: row['GENERO'],
        training_date: row['DATA  DE FORMACAO'],
        status: row['ESTADO'],
        phone_number: row['Nº TELEFONE'],
        bi_number: row['Nº DO BI'],
      };

      const parsed = importAgentsSchema.parse(input);

      agentsBatch.push(parsed);

      if (agentsBatch.length >= BATCH_SIZE) {
        imported += await processBatchAgents(agentsBatch);
      }
    } catch (err) {
      console.log(err);

      if (err instanceof ZodError) {
        errors.push({
          row,
          error: err.issues.map(issue => ({
            campo: issue.path.join('.'),
            mensagem: issue.message,
          })),
        });
      } else {
        errors.push({ row, error: (err as any).message || err });
      }
    }
  }

  if (agentsBatch.length > 0) {
    imported += await processBatchAgents(agentsBatch);
  }
  await updateIdReference();

  await auditImport({ file, user, imported, entity: 'AGENT', desc: 'agentes' });

  return { errors, imported };
}

async function updateIdReference() {
  try {
    await prisma.$transaction(async tx => {
      // Último id_reference da lotaria
      const lastLotaria = await tx.agent.findFirst({
        where: { agent_type: 'lotaria_nacional' },
        orderBy: { id_reference: 'desc' },
        select: { id_reference: true },
      });

      // Último id_reference do revendedor
      const lastRevendedor = await tx.agent.findFirst({
        where: { agent_type: 'revendedor' },
        orderBy: { id_reference: 'desc' },
        select: { id_reference: true },
      });

      // Actualizar a tabela idReference
      if (lastRevendedor?.id_reference) {
        await tx.idReference.update({
          where: { type: 'revendedor' },
          data: {
            counter: lastRevendedor.id_reference,
          },
        });
      }

      if (lastLotaria?.id_reference) {
        await tx.idReference.update({
          where: { type: 'lotaria_nacional' },
          data: {
            counter: lastLotaria.id_reference,
          },
        });
      }
    });
  } catch (error) {
    console.error(error);
  }
}
