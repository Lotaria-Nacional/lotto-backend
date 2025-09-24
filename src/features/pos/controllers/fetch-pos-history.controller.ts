import { Request, Response } from 'express';
import { AuthPayload } from '../../../@types/auth-payload';
import { HttpStatus } from '../../../constants/http';
import { paramsSchema } from '../../../schemas/common/query.schema';
import { hasPermission } from '../../../middleware/auth/permissions';
import { fetchPosHistoryService } from '../services/fetch-pos-history-service';

export async function fetchPosHistoryController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  // await hasPermission({
  //   res,
  //   userId: user.id,
  //   permission: {
  //     action: 'READ',
  //     subject: 'AGENT',
  //   },
  // });

  const query = paramsSchema.parse(req.query);

  const response = await fetchPosHistoryService(query);

  return res.status(HttpStatus.OK).json(response);
}
