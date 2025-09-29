import { Request, Response } from 'express';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { paramsSchema } from '../../../schemas/common/query.schema';
import { hasPermission } from '../../../middleware/auth/permissions';
import { exportTerminalService } from '../services/export-terminal-service';

export async function exportTerminalController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: { action: 'EXPORT', subject: 'TERMINAL' },
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="terminals.csv"');

  const filters = paramsSchema.parse(req.query);

  await exportTerminalService(res, filters);
}
