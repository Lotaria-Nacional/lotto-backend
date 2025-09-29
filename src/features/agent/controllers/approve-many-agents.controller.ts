import z from 'zod';
import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '../../../@types/auth-payload';
import { hasPermission } from '../../../middleware/auth/permissions';
import { approveManyAgentsService } from '../services/approve-many-agents-service';

export const manyIdsSchema = z.object({
  ids: z.array(z.string()),
});

export async function approveManyAgentsController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'APPROVE',
      subject: 'AGENT',
    },
  });

  const { ids } = manyIdsSchema.parse(req.body);

  await approveManyAgentsService(ids, user);

  return res.status(HttpStatus.OK).json({
    message: 'Os agentes foram aprovados',
  });
}
