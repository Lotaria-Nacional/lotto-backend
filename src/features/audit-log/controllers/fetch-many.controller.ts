import type { Response, Request } from 'express';
import { HttpStatus } from '../../../constants/http';
import { paramsSchema } from '../../../schemas/common/query.schema';
import { fetchAuditLogsService } from '../services/fetch-audit-logs.service';

export async function fetchAuditLogsController(req: Request, res: Response) {
  const query = paramsSchema.parse(req.query);
  const response = await fetchAuditLogsService(query);
  return res.status(HttpStatus.OK).json(response);
}
