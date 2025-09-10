import { Request, Response } from 'express';
import { AuthPayload } from '../../../@types/auth-payload';
import { HttpStatus } from '../../../constants/http';
import { paramsSchema } from '../../../schemas/common/query.schema';
import { fetchAgentsService } from '../services/fetch-agents.service';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function fetchAgentsController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  // await hasPermission({
  //   res,
  //   userId: user.id,
  //   permission: {
  //     action: 'READ',
  //     subject: 'Agents',
  //   },
  // });

  const query = paramsSchema.parse(req.query);

  const response = await fetchAgentsService(query);

  return res.status(HttpStatus.OK).json(response);
}
