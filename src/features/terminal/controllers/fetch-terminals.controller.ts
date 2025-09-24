import type { Request, Response } from 'express';
import { AuthPayload } from '../../../@types/auth-payload';
import { HttpStatus } from '../../../constants/http';
import { paramsSchema } from '../../../schemas/common/query.schema';
import { fetchTerminalsService } from '../services/fetch-terminals-service';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function fetchTerminalsController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'READ',
      subject: 'TERMINAL',
    },
  });

  const query = paramsSchema.parse(req.query);

  const response = await fetchTerminalsService(query);

  return res.status(HttpStatus.OK).json(response);
}
