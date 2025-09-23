import { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { importLicencesFromCsvService } from '../services/import-licences-sevice';

export async function importLicencesController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  if (!req.file) return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Ficheiro é obrigatório' });

  const filePath = req.file.path;

  const result = await importLicencesFromCsvService(filePath, user);

  return res.status(HttpStatus.OK).json({ result, message: 'Licenças importadas com sucesso.' });
}
