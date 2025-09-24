import { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { importTerminalsFromCsvService } from '../services/import-terminal-service';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function importTerminalsController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'IMPORT',
      subject: 'TERMINAL',
    },
  });

  if (!req.file) {
    return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Ficheiro é obrigatório' });
  }
  const filePath = req.file.path;
  const result = await importTerminalsFromCsvService(filePath, user);

  return res.status(HttpStatus.OK).json({ result, message: 'Terminais importados com sucesso' });
}
