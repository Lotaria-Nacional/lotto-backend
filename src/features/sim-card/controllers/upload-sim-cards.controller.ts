import { Request, Response } from 'express';
import { uploadSimCardsService } from '../services/upload-sim-cards.service';
import { parseCsvSimCards, parseExcelSimCards } from '../utils/parser';

export async function uploadSimCardsController(req: Request, res: Response) {
  try {
    if (!req.file) return res.status(400).json({ error: 'Ficheiro é obrigatório' });

    let data;
    if (req.file.originalname.endsWith('.csv')) {
      data = await parseCsvSimCards(req.file.path);
    } else if (req.file.originalname.endsWith('.xlsx')) {
      data = await parseExcelSimCards(req.file.path);
    } else {
      return res.status(400).json({ error: 'Formato inválido (use CSV ou Excel)' });
    }

    const result = await uploadSimCardsService(data);

    res.json({ result, message: 'Sim cards carregados com sucesso' });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
