import { Request, Response } from 'express';
import { AuthPayload } from '../../../@types/auth-payload';
import { HttpStatus } from '../../../constants/http';
import { paramsSchema } from '../../../schemas/common/query.schema';
import { fetchManyAgents } from '../services/fetch-many-agents.service';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function fetchManyAgentsController(req: Request, res: Response) {
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

  const response = await fetchManyAgents(query);

  return res.status(HttpStatus.OK).json(response);
}
