import type { Response, Request } from 'express';
import { HttpStatus } from '../../../constants/http';
import { paramsSchema } from '../../../schemas/common/query.schema';
import { fetchManyAuditLogs } from '../services/fetch-many-audit-logs.service';

export async function fetchManyAuditLogsController(req: Request, res: Response) {
  const query = paramsSchema.parse(req.query);
  const response = await fetchManyAuditLogs(query);
  return res.status(HttpStatus.OK).json(response);
}
