import type { Response, Request } from 'express';
import { fetchManyAuditLogs } from '../services/fetch-many-audit-logs.service';

export async function fetchManyAuditLogsController(_req: Request, res: Response) {
  const response = await fetchManyAuditLogs();
  return res.status(200).json(response);
}
