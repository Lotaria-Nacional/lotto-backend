import z from 'zod';
import type { Response, Request } from 'express';
import { HttpStatus } from '../../../constants/http';
import blockAgentsActivitiesService from '../services/block-agent-activity-service';

const agentIdsSchema = z.object({
  ids: z.array(z.string()),
});

export async function blockAgentsActivityController(req: Request, res: Response) {
  const { ids } = agentIdsSchema.parse(req.body);

  const { updated } = await blockAgentsActivitiesService(ids);

  return res.status(HttpStatus.OK).json({ message: `${updated} agentes foram bloqueados` });
}
