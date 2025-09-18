import { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { importPosFromCsvService } from '../services/import-pos-sevice';

export async function importPosController(req: Request, res: Response) {
  if (!req.file) {
    return res.status(400).json({ message: 'Arquivo não enviado' });
  }

  const filePath = req.file.path;

  const result = await importPosFromCsvService(filePath);

  return res.status(HttpStatus.CREATED).json({ message: 'POS importados com sucesso.', result });
}
