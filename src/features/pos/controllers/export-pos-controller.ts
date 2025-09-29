import type { Request, Response } from 'express';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { exportPosService } from '../services/export-pos-service';
import { hasPermission } from '../../../middleware/auth/permissions';
import { paramsSchema } from '../../../schemas/common/query.schema';

export async function exportPosController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'EXPORT',
      subject: 'POS',
    },
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="pos.csv"');

  const filters = paramsSchema.parse(req.query);

  await exportPosService(res, filters);
}
