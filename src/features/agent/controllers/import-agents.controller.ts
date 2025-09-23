import { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { importAgentsFromCsvService } from '../services/import-agents.service';

export async function importAgentsController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  if (!req.file) return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Ficheiro é obrigatório' });
  const filePath = req.file.path;

  const result = await importAgentsFromCsvService(filePath, user);

  return res.status(HttpStatus.OK).json({ result, message: 'Upload feito com sucesso' });
}
