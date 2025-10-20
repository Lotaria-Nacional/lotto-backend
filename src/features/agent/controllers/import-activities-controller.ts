import { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { hasPermission } from '../../../middleware/auth/permissions';
import { importActivitiesService } from '../services/import-activities-service';

export async function importActivitiesController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'IMPORT',
      subject: 'AGENT',
    },
  });

  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'Nenhum ficheiro fornecido' });
  }

  await importActivitiesService(files, user);

  return res.status(HttpStatus.OK).json({ message: 'Upload feito com sucesso' });
}
