import { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { importSimCardsFromCsvService } from '../services/import-sim-cards.service';

export async function importSimCardsController(req: Request, res: Response) {
  if (!req.file) return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Ficheiro é obrigatório' });

  const filePath = req.file.path;

  const result = await importSimCardsFromCsvService(filePath);

  res.status(HttpStatus.OK).json({ result, message: 'Sim cards importados com sucesso.' });
}
