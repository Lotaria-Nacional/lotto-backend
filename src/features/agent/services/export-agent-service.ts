import { Response } from 'express';
import { Agent } from '@prisma/client';
import prisma from '../../../lib/prisma';
import { AgentStatus } from '@lotaria-nacional/lotto';

export async function exportAgentService(res: Response) {
  // Cabeçalho CSV
  res.write(`ID, NOME, SOBRENOME, GENERO, Nº TELEFONE, Nº BI, ESTADO, DATA DE FORMACAO\n`);

  let cursor: string | null = null;
  const batchSize = 500;

  while (true) {
    const batch: Agent[] = await prisma.agent.findMany({
      take: batchSize,
      skip: cursor ? 1 : 0,
      ...(cursor ? { cursor: { id: cursor } } : {}),
      orderBy: { id: 'asc' },
    });

    if (batch.length === 0) break;

    for (const agent of batch) {
      const genre = agent.genre === 'female' ? 'Feminino' : 'Masculino';
      const agentStatus: Record<AgentStatus, string> = {
        active: 'Activo',
        approved: 'Apto',
        discontinued: 'Negado',
        disapproved: 'Negado',
        denied: 'Negado',
        scheduled: 'Agendado',
        ready: 'Pronto',
      };

      const line = [
        agent.id_reference,
        agent.first_name,
        agent.last_name,
        genre,
        agent.phone_number,
        agent.bi_number,
        agentStatus[agent.status],
        agent.training_date?.toISOString().split('T')[0] ?? '',
      ]
        .map((v) => `"${v ?? ''}"`)
        .join(',');

      res.write(line + '\n');
    }

    cursor = batch[batch.length - 1].id;
  }

  res.end();
}
