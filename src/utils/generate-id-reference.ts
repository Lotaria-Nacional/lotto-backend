import { AgentType } from '@lotaria-nacional/lotto';
import prisma from '../lib/prisma';

export async function generateIdReference(agentType: AgentType) {
  try {
    const id_reference = await prisma.idReference.update({
      where: { type: agentType },
      data: {
        counter: { increment: 1 },
      },
    });
    return id_reference.counter;
  } catch (error) {
    throw error;
  }
}
