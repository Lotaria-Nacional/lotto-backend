import { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { hasPermission } from '../../../middleware/auth/permissions';
import { importAgentsFromCsvService } from '../services/import-agents-service';

export async function importAgentsController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'IMPORT',
      subject: 'AGENT',
    },
  });

  if (!req.file) return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Ficheiro é obrigatório' });
  const filePath = req.file.path;

  const result = await importAgentsFromCsvService(filePath, user);

  if (result.errors.length > 0) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Erro ao importar alguns agentes',
      imported: result.imported,
      errors: result.errors,
    });
  }

  return res.status(HttpStatus.OK).json({ result, message: 'Upload feito com sucesso' });
}
