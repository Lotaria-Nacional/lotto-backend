import { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { paramsSchema } from '../../../schemas/common/query.schema';
import { hasPermission } from '../../../middleware/auth/permissions';
import { exportLicencesService } from '../services/export-licence-service';

export async function exportLicencesController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'EXPORT',
      subject: 'LICENCE',
    },
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="agents.csv"');

  const filters = paramsSchema.parse(req.query);

  const result = await exportLicencesService(res, filters);

  return res.status(HttpStatus.OK).json({ result, message: 'Licenças importadas com sucesso.' });
}
