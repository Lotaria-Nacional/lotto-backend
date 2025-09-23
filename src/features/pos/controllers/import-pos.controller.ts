import { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { importPosFromCsvService } from '../services/import-pos-sevice';

export async function importPosController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  if (!req.file) {
    return res.status(400).json({ message: 'Arquivo não enviado' });
  }

  const filePath = req.file.path;

  const result = await importPosFromCsvService(filePath, user);

  if (result.errors.length > 0) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Erro ao importar alguns POS',
      imported: result.imported,
      errors: result.errors,
    });
  }

  return res.status(HttpStatus.OK).json({
    message: 'POS importados com sucesso.',
    imported: result.imported,
  });
}
