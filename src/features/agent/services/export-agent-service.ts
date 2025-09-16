import { Agent } from '@prisma/client';
import prisma from '../../../lib/prisma';
import { Response } from 'express';

export async function exportAgentService(res: Response) {
  // Cabeçalho CSV
  res.write(
    'id,id_reference,first_name,last_name,genre,phone_number,afrimoney_number,agent_type,bi_number,status,training_date,approved_at,created_at\n'
  );

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
      const line = [
        agent.id,
        agent.id_reference,
        agent.first_name,
        agent.last_name,
        agent.genre,
        agent.phone_number,
        agent.afrimoney_number,
        agent.agent_type,
        agent.bi_number,
        agent.status,
        agent.training_date?.toISOString(),
        agent.approved_at?.toISOString() ?? '',
        agent.created_at.toISOString(),
      ]
        .map((v) => `"${v ?? ''}"`)
        .join(',');

      res.write(line + '\n');
    }

    cursor = batch[batch.length - 1].id;
  }

  res.end();
}
