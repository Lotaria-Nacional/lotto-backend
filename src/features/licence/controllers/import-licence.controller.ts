import { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { hasPermission } from '../../../middleware/auth/permissions';
import { importLicencesFromCsvService } from '../services/import-licences-sevice';

export async function importLicencesController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'IMPORT',
      subject: 'LICENCE',
    },
  });

  if (!req.file) return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Ficheiro é obrigatório' });

  const filePath = req.file.path;

  const result = await importLicencesFromCsvService(filePath, user);

  if (result.errors.length > 0) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Erro ao importar algumas licenças',
      imported: result.imported,
      errors: result.errors,
    });
  }

  return res.status(HttpStatus.OK).json({ result, message: 'Licenças importadas com sucesso.' });
}
