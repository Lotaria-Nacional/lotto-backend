import z from 'zod';
import type { Response, Request } from 'express';
import { HttpStatus } from '../../../constants/http';
import unBlockAgentsActivitiesService from '../services/unblock-agent-activity-service';

const agentIdsSchema = z.object({
  ids: z.array(z.string()),
});

export async function unblockAgentsActivityController(req: Request, res: Response) {
  const { ids } = agentIdsSchema.parse(req.body);

  const { updated } = await unBlockAgentsActivitiesService(ids);

  return res.status(HttpStatus.OK).json({ message: `${updated} agentes foram desbloqueados` });
}
