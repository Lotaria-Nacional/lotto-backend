import { Request, Response } from 'express';
import { hasPermission } from '../../../middleware/auth/permissions';
import { exportAgentService } from '../services/export-agent-service';
import { AuthPayload } from '@lotaria-nacional/lotto';

export async function exportAgentController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: { action: 'EXPORT', subject: 'AGENT' },
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="agents.csv"');

  await exportAgentService(res);
}
