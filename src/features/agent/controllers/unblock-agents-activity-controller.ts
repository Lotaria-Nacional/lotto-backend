import z from 'zod';
import type { Response, Request } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { hasPermission } from '../../../middleware/auth/permissions';
import unBlockAgentsActivitiesService from '../services/unblock-agent-activity-service';

const agentIdsSchema = z.object({
  ids: z.array(z.string()),
});

export async function unblockAgentsActivityController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  const { ids } = agentIdsSchema.parse(req.body);

  await hasPermission({
    userId: user.id,
    res,
    permission: {
      action: 'BLOCK',
      subject: 'AGENT',
    },
  });

  const { updated } = await unBlockAgentsActivitiesService(ids, user);

  return res.status(HttpStatus.OK).json({ message: `${updated} agentes foram desbloqueados` });
}
