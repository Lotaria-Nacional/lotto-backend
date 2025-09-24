import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '../../../@types/auth-payload';
import { idSchema } from '../../../schemas/common/id.schema';
import { getAgentService } from '../services/get-agent-service';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function getAgentController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    userId: user.id,
    res,
    permission: {
      action: 'READ',
      subject: 'AGENT',
    },
  });

  const { id } = idSchema.parse(req.params);

  const response = await getAgentService(id);

  return res.status(HttpStatus.OK).json(response);
}
